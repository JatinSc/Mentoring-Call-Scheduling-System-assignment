import MqSelect from "../MqSelect";

const CALL_TYPE_OPTIONS = [
  { value: "Resume Revamp", label: "📄 Resume Revamp" },
  { value: "Mock Interview", label: "🎤 Mock Interview" },
  { value: "Job Market Guidance", label: "📈 Job Market Guidance" },
];

export function CallTypeSelector({ callType, onSelectCallType }) {
  return (
    <div className="w-full">
      <MqSelect
        id="call-type-select"
        label="Call Type"
        value={callType}
        onChange={onSelectCallType}
        placeholder="Select Call Type..."
        options={CALL_TYPE_OPTIONS}
        className="relative w-full"
      />
    </div>
  );
}

