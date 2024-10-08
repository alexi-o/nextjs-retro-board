"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Stepper from "@/components/Stepper";
import ReflectColumn from "@/components/ReflectColumn";
import Poll from "@/components/Poll";

export default function RetrospectivePage() {
  const searchParams = useSearchParams();
  const retrospectiveId = searchParams.get("id");
  const [retrospective, setRetrospective] = useState(null);
  const [currentStep, setCurrentStep] = useState("reflect");
  const supabase = createClient();

  useEffect(() => {
    const fetchRetrospective = async () => {
      const { data, error } = await supabase
        .from("retrospectives")
        .select("*")
        .eq("id", retrospectiveId)
        .single();

      if (error) {
        console.error("Error fetching retrospective:", error);
      } else {
        setRetrospective(data);
      }
    };

    if (retrospectiveId) {
      fetchRetrospective();
    }
  }, [retrospectiveId, supabase]);

  if (!retrospective) {
    return <div className="text-center text-white">Loading...</div>;
  }

  return (
    <div className="flex flex-col bg-gray-400 text-white">
      <Stepper
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        retrospectiveTitle={retrospective.title}
      />
      <div className="flex-1 container mx-auto p-4">
        <div className="grid h-screen grid-cols-1 md:grid-cols-4 gap-2">
          <div className="">
            <Poll retrospectiveId={retrospectiveId} step={currentStep} />
          </div>
          <ReflectColumn
            sentiment="Glad"
            emoji="😊"
            retrospectiveId={retrospectiveId}
            step={currentStep}
          />
          <ReflectColumn
            sentiment="Bad"
            emoji="😢"
            retrospectiveId={retrospectiveId}
            step={currentStep}
          />
          <ReflectColumn
            sentiment="Mad"
            emoji="😡"
            retrospectiveId={retrospectiveId}
            step={currentStep}
          />
        </div>
      </div>
    </div>
  );
}
