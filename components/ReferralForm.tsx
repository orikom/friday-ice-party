"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const referralSchema = z.object({
  // Step 1: Basic Info
  email: z.string().email("Invalid email address"),
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  age: z.number().optional().nullable(),

  // Step 2: Relationship
  howDoYouKnow: z.string().min(1, "Please tell us how you know them"),
  howLong: z.string().min(1, "Please specify how long you've known them"),

  // Step 3: Professional
  occupation: z.string().optional(),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid LinkedIn URL" }
    ),
  instagramUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid Instagram URL" }
    ),

  // Step 4: Personal
  city: z.string().optional(),
  hobbies: z.string().optional(),
  interests: z.string().optional(),

  // Step 5: Additional
  notes: z.string().optional(),
});

type ReferralFormData = z.infer<typeof referralSchema>;

const STEPS = [
  { number: 1, title: "Basic Information", description: "Who is this person?" },
  { number: 2, title: "Relationship", description: "How do you know them?" },
  { number: 3, title: "Professional", description: "Work & online presence" },
  { number: 4, title: "Personal", description: "Interests & hobbies" },
  { number: 5, title: "Additional Notes", description: "Anything else?" },
];

export function ReferralForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<ReferralFormData>({
    resolver: zodResolver(referralSchema),
    mode: "onChange",
  });

  const progress = (currentStep / STEPS.length) * 100;

  const validateStep = async (step: number): Promise<boolean> => {
    let fields: (keyof ReferralFormData)[] = [];

    switch (step) {
      case 1:
        fields = ["email", "name"];
        break;
      case 2:
        fields = ["howDoYouKnow", "howLong"];
        break;
      case 3:
        fields = ["linkedinUrl", "instagramUrl"]; // Optional fields
        break;
      case 4:
        fields = []; // All optional
        break;
      case 5:
        fields = []; // Optional
        break;
    }

    if (fields.length > 0) {
      const result = await trigger(fields);
      return result;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const onSubmit = async (data: ReferralFormData) => {
    console.log("Form submitted with data:", data);
    setSubmitting(true);
    try {
      // Convert age string to number if provided
      const payload = {
        ...data,
        age: data.age ? parseInt(String(data.age)) : null,
      };

      console.log("Sending payload:", payload);

      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("API error:", error);
        throw new Error(error.error || "Failed to submit referral");
      }

      const result = await response.json();
      console.log("Success:", result);

      router.push("/referrals/success");
    } catch (error) {
      console.error("Referral submission error:", error);
      alert(
        error instanceof Error ? error.message : "Failed to submit referral"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Refer a New Member</h1>
        <p className="text-gray-600">
          Help grow our community by referring someone you know
        </p>
      </div>

      {/* Progress Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                Step {currentStep} of {STEPS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-sm font-medium mt-2">
              {STEPS[currentStep - 1].title}
            </p>
            <p className="text-xs text-gray-500">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </CardContent>
      </Card>

      <form
        onSubmit={handleSubmit(onSubmit, (errors) => {
          console.log("Form validation errors:", errors);
          // Scroll to first error field
          const firstError = Object.keys(errors)[0];
          if (firstError) {
            const element = document.getElementById(firstError);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }
        })}
      >
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label htmlFor="email" className="mb-2 block">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    placeholder="person@example.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name" className="mb-2 block">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="mb-2 block">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    {...register("phone")}
                    placeholder="+972 50-123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="age" className="mb-2 block">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    {...register("age", { valueAsNumber: true })}
                    placeholder="25"
                    min={18}
                    max={100}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Relationship */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label htmlFor="howDoYouKnow" className="mb-2 block">
                    How do you know this person? *
                  </Label>
                  <select
                    id="howDoYouKnow"
                    {...register("howDoYouKnow")}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="friend">Friend</option>
                    <option value="colleague">Colleague / Co-worker</option>
                    <option value="classmate">Classmate / School</option>
                    <option value="family">Family</option>
                    <option value="neighbor">Neighbor</option>
                    <option value="met-at-event">Met at an event</option>
                    <option value="online">Met online</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.howDoYouKnow && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.howDoYouKnow.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="howLong" className="mb-2 block">
                    How long have you known them? *
                  </Label>
                  <select
                    id="howLong"
                    {...register("howLong")}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Select...</option>
                    <option value="less-than-6-months">
                      Less than 6 months
                    </option>
                    <option value="6-months-1-year">6 months - 1 year</option>
                    <option value="1-2-years">1-2 years</option>
                    <option value="2-5-years">2-5 years</option>
                    <option value="more-than-5-years">More than 5 years</option>
                  </select>
                  {errors.howLong && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.howLong.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Professional */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label htmlFor="occupation" className="mb-2 block">
                    Occupation / Profession
                  </Label>
                  <Input
                    id="occupation"
                    {...register("occupation")}
                    placeholder="Software Engineer, Designer, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl" className="mb-2 block">
                    LinkedIn Profile URL
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    {...register("linkedinUrl")}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedinUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.linkedinUrl.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="instagramUrl" className="mb-2 block">
                    Instagram Profile URL
                  </Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    {...register("instagramUrl")}
                    placeholder="https://instagram.com/username"
                  />
                  {errors.instagramUrl && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.instagramUrl.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Personal */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label htmlFor="city" className="mb-2 block">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    placeholder="Tel Aviv, Jerusalem, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="hobbies" className="mb-2 block">
                    Hobbies
                  </Label>
                  <Input
                    id="hobbies"
                    {...register("hobbies")}
                    placeholder="e.g., Swimming, Reading, Cooking, Traveling"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple hobbies with commas
                  </p>
                </div>

                <div>
                  <Label htmlFor="interests" className="mb-2 block">
                    Interests
                  </Label>
                  <Input
                    id="interests"
                    {...register("interests")}
                    placeholder="e.g., Technology, Music, Fitness, Art"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate multiple interests with commas
                  </p>
                </div>
              </div>
            )}

            {/* Step 5: Additional Notes */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <Label htmlFor="notes" className="mb-2 block">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    {...register("notes")}
                    rows={6}
                    placeholder="Tell us anything else you think would be helpful for us to know about this person. Why do you think they would be a good fit for our community?"
                    onKeyDown={(e) => {
                      // Only allow Shift+Enter for new lines, prevent Enter from submitting
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        // You can still use Shift+Enter for new lines
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                ← Back
              </Button>
              {currentStep < STEPS.length ? (
                <Button type="button" onClick={handleNext}>
                  Next →
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={submitting}
                  onClick={(e) => {
                    console.log(
                      "Submit button clicked, currentStep:",
                      currentStep
                    );
                    if (currentStep !== STEPS.length) {
                      e.preventDefault();
                      console.log("Prevented submit - not on last step");
                    }
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Referral"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
