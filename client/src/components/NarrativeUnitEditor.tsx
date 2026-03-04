import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";

interface Shot {
  start_time: number;
  end_time: number;
  shot_type: string;
  camera_behavior: string;
  subject: string;
  action: string;
  focus_notes?: string;
}

interface Dialogue {
  enabled: boolean;
  speaker: string;
  speaker_label: string;
  text: string;
  word_count: number;
  delivery: string;
  trigger_time: number;
  clarity_notes: string;
}

interface NarrativeUnit {
  unit_id: string;
  time_range: string;
  duration_sec: number;
  narrative_beat: {
    role: string;
    description: string;
    emotion_shift?: string;
  };
  shot_list: Shot[];
  dialogue?: Dialogue;
}

interface Props {
  unitNumber: number;
  startTime: number;
  endTime: number;
  characters: any[];
  onUpdate: (unit: NarrativeUnit) => void;
}

export default function NarrativeUnitEditor({ unitNumber, startTime, endTime, characters, onUpdate }: Props) {
  const duration = endTime - startTime;
  
  const [unit, setUnit] = useState<NarrativeUnit>({
    unit_id: `UNIT_${unitNumber.toString().padStart(2, '0')}`,
    time_range: `${Math.floor(startTime / 60)}:${(startTime % 60).toString().padStart(2, '0')}-${Math.floor(endTime / 60)}:${(endTime % 60).toString().padStart(2, '0')}`,
    duration_sec: duration,
    narrative_beat: {
      role: "setup",
      description: "",
    },
    shot_list: [
      {
        start_time: 0,
        end_time: duration,
        shot_type: "medium",
        camera_behavior: "handheld",
        subject: "",
        action: "",
      }
    ],
  });

  const updateUnit = (updates: Partial<NarrativeUnit>) => {
    const newUnit = { ...unit, ...updates };
    setUnit(newUnit);
    onUpdate(newUnit);
  };

  const updateNarrativeBeat = (field: string, value: string) => {
    updateUnit({
      narrative_beat: {
        ...unit.narrative_beat,
        [field]: value,
      }
    });
  };

  const addShot = () => {
    const lastShot = unit.shot_list[unit.shot_list.length - 1];
    const newShot: Shot = {
      start_time: lastShot.end_time,
      end_time: duration,
      shot_type: "medium",
      camera_behavior: "handheld",
      subject: "",
      action: "",
    };
    updateUnit({
      shot_list: [...unit.shot_list, newShot]
    });
  };

  const updateShot = (index: number, updates: Partial<Shot>) => {
    const newShotList = [...unit.shot_list];
    newShotList[index] = { ...newShotList[index], ...updates };
    updateUnit({ shot_list: newShotList });
  };

  const removeShot = (index: number) => {
    if (unit.shot_list.length === 1) return; // Keep at least one shot
    const newShotList = unit.shot_list.filter((_, i) => i !== index);
    updateUnit({ shot_list: newShotList });
  };

  const toggleDialogue = () => {
    if (unit.dialogue?.enabled) {
      updateUnit({ dialogue: undefined });
    } else {
      updateUnit({
        dialogue: {
          enabled: true,
          speaker: characters[0]?.char_id || "",
          speaker_label: characters[0]?.label || "",
          text: "",
          word_count: 0,
          delivery: "matter-of-fact",
          trigger_time: duration / 2,
          clarity_notes: "dialogue intelligible above ambience, no masking",
        }
      });
    }
  };

  const updateDialogue = (field: string, value: any) => {
    if (!unit.dialogue) return;
    
    const updates: any = { [field]: value };
    
    // Auto-calculate word count if text changes
    if (field === "text") {
      updates.word_count = value.trim().split(/\s+/).filter(Boolean).length;
    }
    
    updateUnit({
      dialogue: {
        ...unit.dialogue,
        ...updates,
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Unit {unitNumber}</CardTitle>
          <Badge variant="outline">{startTime}s - {endTime}s ({duration}s)</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Narrative Beat */}
        <div className="space-y-4">
          <Label>Narrative Beat</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`beat-role-${unitNumber}`} className="text-xs">Role</Label>
              <Select 
                value={unit.narrative_beat.role} 
                onValueChange={(v) => updateNarrativeBeat("role", v)}
              >
                <SelectTrigger id={`beat-role-${unitNumber}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="setup">Setup</SelectItem>
                  <SelectItem value="conflict">Conflict</SelectItem>
                  <SelectItem value="escalation">Escalation</SelectItem>
                  <SelectItem value="reaction">Reaction</SelectItem>
                  <SelectItem value="payoff">Payoff</SelectItem>
                  <SelectItem value="resolution">Resolution</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`emotion-shift-${unitNumber}`} className="text-xs">Emotion Shift</Label>
              <Input
                id={`emotion-shift-${unitNumber}`}
                placeholder="e.g., neutral → confusion"
                value={unit.narrative_beat.emotion_shift || ""}
                onChange={(e) => updateNarrativeBeat("emotion_shift", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`beat-desc-${unitNumber}`} className="text-xs">What Happens</Label>
            <Textarea
              id={`beat-desc-${unitNumber}`}
              placeholder="Describe what happens in this 8-second unit..."
              value={unit.narrative_beat.description}
              onChange={(e) => updateNarrativeBeat("description", e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {/* Shot List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Shot List</Label>
            <Button onClick={addShot} size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add Shot
            </Button>
          </div>
          
          {unit.shot_list.map((shot, idx) => (
            <div key={idx} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Shot {idx + 1}</span>
                {unit.shot_list.length > 1 && (
                  <Button onClick={() => removeShot(idx)} size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Start Time (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={shot.start_time}
                    onChange={(e) => updateShot(idx, { start_time: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">End Time (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={shot.end_time}
                    onChange={(e) => updateShot(idx, { end_time: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Shot Type</Label>
                  <Select 
                    value={shot.shot_type} 
                    onValueChange={(v) => updateShot(idx, { shot_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wide">Wide</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="close-up">Close-up</SelectItem>
                      <SelectItem value="extreme-close-up">Extreme Close-up</SelectItem>
                      <SelectItem value="over-shoulder">Over-Shoulder</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Camera Behavior</Label>
                  <Input
                    placeholder="e.g., handheld follow"
                    value={shot.camera_behavior}
                    onChange={(e) => updateShot(idx, { camera_behavior: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Subject</Label>
                <Input
                  placeholder="Who/what is in frame"
                  value={shot.subject}
                  onChange={(e) => updateShot(idx, { subject: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Action</Label>
                <Textarea
                  placeholder="What happens in this shot"
                  value={shot.action}
                  onChange={(e) => updateShot(idx, { action: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Focus Notes (optional)</Label>
                <Input
                  placeholder="e.g., shallow DOF on trainer"
                  value={shot.focus_notes || ""}
                  onChange={(e) => updateShot(idx, { focus_notes: e.target.value })}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Dialogue */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Dialogue</Label>
            <Button onClick={toggleDialogue} size="sm" variant={unit.dialogue?.enabled ? "destructive" : "outline"}>
              {unit.dialogue?.enabled ? "Remove Dialogue" : "Add Dialogue"}
            </Button>
          </div>

          {unit.dialogue?.enabled && (
            <div className="p-4 border rounded-lg space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Speaker</Label>
                  <Select 
                    value={unit.dialogue.speaker} 
                    onValueChange={(v) => {
                      const char = characters.find(c => c.char_id === v);
                      updateDialogue("speaker", v);
                      updateDialogue("speaker_label", char?.label || "");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {characters.map(char => (
                        <SelectItem key={char.char_id} value={char.char_id}>
                          {char.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Trigger Time (s)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={duration}
                    step={0.5}
                    value={unit.dialogue.trigger_time}
                    onChange={(e) => updateDialogue("trigger_time", parseFloat(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Dialogue Text</Label>
                <Textarea
                  placeholder="What does the character say?"
                  value={unit.dialogue.text}
                  onChange={(e) => updateDialogue("text", e.target.value)}
                  rows={2}
                />
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Word count: {unit.dialogue.word_count}</span>
                  {unit.dialogue.word_count > 22 && (
                    <span className="text-destructive font-medium">⚠️ Exceeds 22-word limit</span>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Delivery/Tone</Label>
                <Input
                  placeholder="e.g., matter-of-fact, deadpan"
                  value={unit.dialogue.delivery}
                  onChange={(e) => updateDialogue("delivery", e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
