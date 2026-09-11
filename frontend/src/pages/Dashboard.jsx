import React, { useState } from "react";
import { Flame, Activity, User, Zap } from "lucide-react";
import { MOCK_ERRORS } from "../data/mockErrors";
import MetricCard from "../components/MetricCard";
import ErrorList from "../components/ErrorList";
import ErrorDetails from "../components/ErrorDetails";
import IncidentStreamContainer from "../components/IncidentStreamContainer";

export default function Dashboard() {
  const [errors, setErrors] = useState(MOCK_ERRORS);
  const [selectedError, setSelectedError] = useState(MOCK_ERRORS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isApplyingFix, setIsApplyingFix] = useState(false);
  const [fixApplied, setFixApplied] = useState(false);

  const handleSelectError = (error) => {
    setSelectedError(error);
    setFixApplied(error.status === "resolved");
  };

  const handleApplyFix = () => {
    setIsApplyingFix(true);
    setTimeout(() => {
      setIsApplyingFix(false);
      setFixApplied(true);
      setErrors((prev) =>
        prev.map((err) =>
          err.id === selectedError.id ? { ...err, status: "resolved" } : err,
        ),
      );
      setSelectedError((prev) => ({ ...prev, status: "resolved" }));
    }, 1200);
  };

  const filteredErrors = errors.filter(
    (err) =>
      err.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      err.service.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Incidents"
          value={errors.length.toString()}
          icon={<Flame className="w-5 h-5 text-red-400" />}
          trend="+12% today"
        />
        <MetricCard
          title="Events Captured"
          value="1,482"
          icon={<Activity className="w-5 h-5 text-sky-400" />}
          trend="32 req/sec"
        />
        <MetricCard
          title="Affected Users"
          value="93"
          icon={<User className="w-5 h-5 text-amber-400" />}
          trend="2.4% active"
        />
        <MetricCard
          title="AI Diagnostics"
          value="100%"
          icon={<Zap className="w-5 h-5 text-purple-400" />}
          trend="Auto-patched"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* <ErrorList
          errors={filteredErrors}
          selectedError={selectedError}
          onSelectError={setSelectedError}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        /> */}
        <IncidentStreamContainer />
        <ErrorDetails selectedError={selectedError} />
      </div>
    </>
  );
}
