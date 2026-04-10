import { useState, useEffect } from "react";
import { useGet, usePost } from "@/hooks/useApi";
import { useRealtime } from "@/hooks/useRealtime";
import { useAuth } from "@/contexts/AuthContext";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  Check, 
  Search, 
  Clock, 
  Scale, 
  ChevronRight,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// --- Sub-components ---

interface SortableItemProps {
  id: string;
  item: any;
  onSelect: (item: any) => void;
  isActive: boolean;
}

function SortableQueueItem({ id, item, onSelect, isActive }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group relative flex items-center gap-3 rounded-lg border p-3 transition-all hover:border-primary/50 ${
        isActive ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card'
      }`}
    >
      <div {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground hover:text-foreground">
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 cursor-pointer" onClick={() => onSelect(item)}>
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] font-bold text-primary">{item.treeNumber}</span>
          {item.status === 'judged' && <Badge className="bg-emerald-500 hover:bg-emerald-600 h-4 px-1.5 text-[9px]">Judged</Badge>}
        </div>
        <p className="font-medium text-sm truncate">{item.treeName}</p>
        <p className="text-[10px] text-muted-foreground truncate">{item.species}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}

const criteria = [
  { key: "nebari", label: "Nebari (Root Spread)", description: "Visual quality and distribution of surface roots." },
  { key: "trunk", label: "Trunk Quality", description: "Taper, bark texture, and movement of the main trunk." },
  { key: "branch", label: "Branch Structure", description: "Placement, ramification, and health of branches." },
  { key: "composition", label: "Composition Balance", description: "Overall visual harmony and stylistic execution." },
  { key: "pot", label: "Pot Harmony", description: "Relationship between tree, pot, and optional stand." },
];

interface ScorePayload {
  nebari: number;
  trunk: number;
  branch: number;
  composition: number;
  pot: number;
}

interface SubmitScoreResponse {
  message: string;
  totalScore: number;
  scores: ScorePayload;
}

// --- Main Page ---

export default function AdminJudgingPage() {
  const { user } = useAuth();
  const [queue, setQueue] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [scores, setScores] = useState<ScorePayload>({
    nebari: 15,
    trunk: 15,
    branch: 15,
    composition: 15,
    pot: 15,
  });

  // API Hooks
  const { data: queueData, isLoading } = useGet<any[]>(['judging-queue'], '/queue');
  const updateQueueMutation = usePost('/queue/reorder', [['judging-queue']]);
  const submitScoreMutation = usePost<{ participantId: string; scores: ScorePayload }, SubmitScoreResponse>(
    '/scoring/submit',
    [['judging-queue'], ['event-status'], ['rankings'], ['live-arena-init']]
  );

  // Real-time Queue Updates
  const { lastData: realtimeQueue } = useRealtime('queue-update', (data) => {
    if (data) setQueue(data);
  });

  const isJudgeOnly = user?.role === 'juri';

  useEffect(() => {
    if (queueData) setQueue(queueData);
  }, [queueData]);

  // DnD Config
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = queue.findIndex((i) => i.id === active.id);
      const newIndex = queue.findIndex((i) => i.id === over.id);
      const newQueue = arrayMove(queue, oldIndex, newIndex);
      setQueue(newQueue);
      
      try {
        await updateQueueMutation.mutateAsync({ 
          items: newQueue.map((item, index) => ({ id: item.id, order: index })) 
        });
      } catch (err) {
        toast.error("Failed to update queue order");
        setQueue(queue); // rollback
      }
    }
  };

  const handleOpenScoring = (item: any) => {
    setSelectedItem(item);
    // Load existing scores if already judged
    if (item.scores) {
      setScores(item.scores);
    } else {
      setScores({ nebari: 15, trunk: 15, branch: 15, composition: 15, pot: 15 });
    }
    setIsScoringModalOpen(true);
  };

  const handleSubmitScore = async () => {
    try {
      const response = await submitScoreMutation.mutateAsync({
        participantId: selectedItem.id,
        scores
      });
      const nextSelectedItem = {
        ...selectedItem,
        status: 'judged',
        scores: response.scores,
        totalScore: response.totalScore,
      };

      setSelectedItem(nextSelectedItem);
      setQueue((currentQueue) =>
        currentQueue.map((item) => (
          item.id === selectedItem.id ? nextSelectedItem : item
        ))
      );
      setScores(response.scores);
      toast.success(`Score submitted for ${selectedItem.treeName}`);
      setIsScoringModalOpen(false);
    } catch (err) {
      toast.error("Failed to submit score");
    }
  };

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-6 overflow-hidden">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Digital Judging System</h1>
        <p className="text-sm text-muted-foreground">
          {isJudgeOnly ? 'Lihat antrean penilaian dan submit score sesuai akses juri.' : 'Manage judging queue and submit real-time scores'}
        </p>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-6 overflow-hidden lg:grid-cols-3">
        {/* Queue Column */}
        <Card className="flex flex-col overflow-hidden lg:col-span-1">
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                <Clock className="h-5 w-5 text-primary" />
                Judging Queue
              </h2>
              <Badge variant="outline">{queue.length} Entries</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tree number or name..." className="pl-8" />
            </div>
          </div>
          <CardContent className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted" />)}
              </div>
            ) : isJudgeOnly ? (
              <div className="space-y-3">
                {queue.map((item) => (
                  <SortableQueueItem 
                    key={item.id} 
                    id={item.id} 
                    item={item} 
                    onSelect={handleOpenScoring}
                    isActive={selectedItem?.id === item.id}
                  />
                ))}
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={queue} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {queue.map((item) => (
                      <SortableQueueItem 
                        key={item.id} 
                        id={item.id} 
                        item={item} 
                        onSelect={handleOpenScoring}
                        isActive={selectedItem?.id === item.id}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Workspace Column */}
        <Card className="flex flex-col overflow-hidden lg:col-span-2 bg-muted/20 border-dashed">
          {selectedItem ? (
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="border-b bg-background/50 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border bg-background">
                      <img 
                        src={selectedItem.imageUrl || '/placeholder.svg'} 
                        alt={selectedItem.treeName} 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="passport-id">{selectedItem.treeNumber}</span>
                        {selectedItem.status === 'judged' && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-200">
                            Already Judged
                          </Badge>
                        )}
                      </div>
                      <h2 className="mt-1 font-display text-xl font-bold">{selectedItem.treeName}</h2>
                      <p className="text-sm italic text-muted-foreground">{selectedItem.species}</p>
                    </div>
                  </div>
                  <Button size="lg" className="sm:w-auto" onClick={() => setIsScoringModalOpen(true)}>
                    <Scale className="mr-2 h-4 w-4" /> 
                    {selectedItem.status === 'judged' ? 'Edit Scores' : 'Start Scoring'}
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                  <div className="rounded-xl border bg-background p-6 shadow-sm">
                    <h3 className="mb-4 font-display text-lg font-semibold flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" />
                      {isJudgeOnly ? 'Entry Details' : 'Participant Details'}
                    </h3>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      {!isJudgeOnly && (
                        <>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Owner</p>
                            <p className="mt-1 font-medium">{selectedItem.ownerName}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wider text-muted-foreground">Location</p>
                            <p className="mt-1 font-medium">{selectedItem.city}</p>
                          </div>
                        </>
                      )}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Size Category</p>
                        <Badge variant="secondary" className="mt-1">{selectedItem.sizeCategory || 'Large'}</Badge>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground">Event</p>
                        <p className="mt-1 font-medium text-primary">Depok Bonsai Festival 2026</p>
                      </div>
                      {isJudgeOnly && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground">Visibilitas</p>
                          <p className="mt-1 font-medium">Mode penjurian anonim aktif</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedItem.status === 'judged' && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6">
                       <h3 className="mb-4 font-display text-lg font-semibold text-emerald-800">Final Results</h3>
                       <div className="flex items-end justify-between">
                          <div className="space-y-2">
                             {criteria.map(c => (
                               <div key={c.key} className="flex gap-4 text-sm">
                                  <span className="w-32 text-muted-foreground">{c.label}</span>
                                  <span className="font-mono font-bold text-emerald-700">{selectedItem.scores?.[c.key] || 0}</span>
                               </div>
                             ))}
                          </div>
                          <div className="text-center">
                             <div className="text-[10px] uppercase font-bold text-emerald-600">Total Score</div>
                             <div className="text-5xl font-mono font-black text-emerald-700">{selectedItem.totalScore}</div>
                          </div>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <Scale className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No Tree Selected</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Select a tree from the queue or search to begin the digital judging process.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Scoring Dialog */}
      <Dialog open={isScoringModalOpen} onOpenChange={setIsScoringModalOpen}>
        <DialogContent className="max-w-2xl overflow-hidden p-0 sm:rounded-2xl">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="font-display text-2xl">Digital Scoring Terminal</DialogTitle>
            <DialogDescription>
              Assign scores for {selectedItem?.treeName} ({selectedItem?.treeNumber})
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
            {criteria.map(({ key, label, description }) => (
              <div key={key} className="group rounded-xl border border-muted bg-muted/10 p-4 transition-colors hover:bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-primary">{label}</label>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
                  </div>
                  <span className="font-mono text-xl font-black text-primary bg-background px-3 py-1 rounded-lg border tabular-nums">
                    {scores[key]}/20
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={scores[key]}
                  onChange={(e) => setScores({ ...scores, [key]: Number(e.target.value) })}
                  className="w-full h-2 bg-muted rounded-lg appearance-none accent-primary cursor-pointer mt-2"
                />
                <div className="flex justify-between mt-2 px-1">
                   <span className="text-[10px] text-muted-foreground font-medium">0</span>
                   <span className="text-[10px] text-muted-foreground font-medium">10</span>
                   <span className="text-[10px] text-muted-foreground font-medium">20</span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-muted/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">Final Total:</span>
              <AnimatePresence mode="wait">
                <motion.span 
                  key={totalScore}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="font-mono text-4xl font-black text-primary tabular-nums"
                >
                  {totalScore}
                </motion.span>
              </AnimatePresence>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsScoringModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 sm:flex-none px-8" 
                onClick={handleSubmitScore}
                disabled={submitScoreMutation.isPending}
              >
                {submitScoreMutation.isPending ? 'Saving...' : 'Submit Final Score'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
