"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "./components/ui/button";

import { Progress } from "./components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";
import { CheckCircle2 } from "lucide-react";

const generateRandomNDC = () => {
  const part1 = Math.floor(Math.random() * 99999)
    .toString()
    .padStart(5, "0");
  const part2 = Math.floor(Math.random() * 9999)
    .toString()
    .padStart(4, "0");
  const part3 = Math.floor(Math.random() * 99)
    .toString()
    .padStart(2, "0");
  return `${part1}-${part2}-${part3}`;
};

const ndcList = Array.from({ length: 10 }, generateRandomNDC);

export default function PowderDispenser() {
  const [ndc, setNDC] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [isApproved, setIsApproved] = useState(false);
  const [requiredWeight, setRequiredWeight] = useState(0);
  const [currentWeight, setCurrentWeight] = useState(0);
  const [isDispensing, setIsDispensing] = useState(false);
  const [finalWeight, setFinalWeight] = useState(0);
  const [completionMessage, setCompletionMessage] = useState("");

  useEffect(() => {
    if (ndc) {
      const generateLotNumber = () => {
        const randomPart = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0");
        setLotNumber(`${ndc.slice(-4)}${randomPart}`);
      };
      generateLotNumber();
      setIsApproved(false);
      setRequiredWeight(0);
      setCurrentWeight(0);
      setIsDispensing(false);
      setFinalWeight(0);
      setCompletionMessage("");
    }
  }, [ndc]);

  useEffect(() => {
    if (isApproved) {
      const weight = Math.random() * (100 - 0.5) + 0.5;
      setRequiredWeight(parseFloat(weight.toFixed(2)));
    }
  }, [isApproved]);

  useEffect(() => {
    if (isDispensing) {
      const errorMargin = 0.05 * requiredWeight; // 5% error margin
      const lowerBound = requiredWeight - errorMargin;
      const upperBound = requiredWeight + errorMargin;

      const timer = setInterval(() => {
        setCurrentWeight((prev) => {
          const increment = Math.random() * 0.5 + 0.1; // Random increment between 0.1 and 0.6
          const newWeight = parseFloat((prev + increment).toFixed(2));

          if (newWeight >= lowerBound && newWeight <= upperBound) {
            clearInterval(timer);
            setIsDispensing(false);
            setFinalWeight(newWeight);
            handleComplete(newWeight);
            return newWeight;
          }

          return newWeight > upperBound ? upperBound : newWeight;
        });
      }, 100);

      return () => clearInterval(timer);
    }
  }, [isDispensing, requiredWeight]);

  const handleApproval = useCallback(() => {
    setIsApproved(true);
  }, []);

  const handleDispense = useCallback(() => {
    setIsDispensing(true);
  }, []);

  const handleNDCChange = useCallback((value: string) => {
    setNDC(value);
  }, []);

  const handleComplete = useCallback((weight: number) => {
    setCompletionMessage(
      `Dispensing completed with final weight: ${weight.toFixed(2)}g`
    );
    console.log(
      `Dispensing completed with final weight: ${weight.toFixed(2)}g`
    );
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Powder Dispenser</h2>

      <div className="mb-4">
        <label
          htmlFor="ndc-select"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Select NDC
        </label>
        <Select onValueChange={handleNDCChange}>
          <SelectTrigger id="ndc-select">
            <SelectValue placeholder="Select an NDC" />
          </SelectTrigger>
          <SelectContent>
            {ndcList.map((ndc) => (
              <SelectItem key={ndc} value={ndc}>
                {ndc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {ndc && (
        <>
          <p className="mb-2">
            <strong>NDC:</strong> {ndc}
          </p>
          <p className="mb-4">
            <strong>Lot Number:</strong> {lotNumber}
          </p>

          {!isApproved ? (
            <Button onClick={handleApproval} className="mb-4">
              Approve
            </Button>
          ) : (
            <>
              <p className="mb-2">
                <strong>Required Weight:</strong> {requiredWeight}g
              </p>
              {!isDispensing && currentWeight === 0 && (
                <Button onClick={handleDispense} className="mb-4">
                  Start Dispensing
                </Button>
              )}
              {(isDispensing || currentWeight > 0) && (
                <>
                  <div className="mb-2">
                    <strong>Current Weight:</strong> {currentWeight.toFixed(2)}g
                  </div>
                  <Progress
                    value={(currentWeight / requiredWeight) * 100}
                    className="mb-4"
                    aria-label="Dispensing progress"
                  />
                </>
              )}
              {finalWeight > 0 && (
                <Alert className="mb-4">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Dispensing Complete</AlertTitle>
                  <AlertDescription>
                    Final Weight: {finalWeight.toFixed(2)}g
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </>
      )}

      {completionMessage && (
        <Alert variant="default">
          <AlertTitle>Process Complete</AlertTitle>
          <AlertDescription>{completionMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
