import { useStreamContext } from "@/providers/Stream";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AgentSelector() {
  const { assistantId, setAssistantId, availableAgents } = useStreamContext();

  if (availableAgents.length <= 1) return null;

  return (
    <Select
      value={assistantId}
      onValueChange={setAssistantId}
    >
      <SelectTrigger className="h-9 w-auto min-w-[140px] text-sm">
        <SelectValue placeholder="Select agent" />
      </SelectTrigger>
      <SelectContent>
        {availableAgents.map((agent) => (
          <SelectItem
            key={agent}
            value={agent}
          >
            {agent}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
