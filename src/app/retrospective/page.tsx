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
    <div className="min-h-screen flex flex-col bg-gray-400 text-white">
      <Stepper currentStep={currentStep} onStepChange={setCurrentStep} />
      <div className="flex-1 container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-8">{retrospective.title}</h1>

        {currentStep === "reflect" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="h-full">
              <Poll retrospectiveId={retrospectiveId} step="reflect" />
            </div>
            <ReflectColumn
              sentiment="Glad"
              retrospectiveId={retrospectiveId}
              step="reflect"
            />
            <ReflectColumn
              sentiment="Mad"
              retrospectiveId={retrospectiveId}
              step="reflect"
            />
            <ReflectColumn
              sentiment="Bad"
              retrospectiveId={retrospectiveId}
              step="reflect"
            />
          </div>
        )}

        {currentStep === "group" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
            <ReflectColumn
              sentiment="Glad"
              retrospectiveId={retrospectiveId}
              step="group"
            />
            <ReflectColumn
              sentiment="Mad"
              retrospectiveId={retrospectiveId}
              step="group"
            />
            <ReflectColumn
              sentiment="Bad"
              retrospectiveId={retrospectiveId}
              step="group"
            />
          </div>
        )}

        {currentStep === "vote" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
            <ReflectColumn
              sentiment="Glad"
              retrospectiveId={retrospectiveId}
              step="vote"
            />
            <ReflectColumn
              sentiment="Mad"
              retrospectiveId={retrospectiveId}
              step="vote"
            />
            <ReflectColumn
              sentiment="Bad"
              retrospectiveId={retrospectiveId}
              step="vote"
            />
          </div>
        )}

        {currentStep === "discuss" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full">
            <ReflectColumn
              sentiment="Glad"
              retrospectiveId={retrospectiveId}
              step="discuss"
            />
            <ReflectColumn
              sentiment="Mad"
              retrospectiveId={retrospectiveId}
              step="discuss"
            />
            <ReflectColumn
              sentiment="Bad"
              retrospectiveId={retrospectiveId}
              step="discuss"
            />
          </div>
        )}
      </div>
    </div>
  );
}
