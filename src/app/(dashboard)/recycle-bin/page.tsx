"use client";
import { useState, useEffect } from "react";

import { useGlobalStore } from "@/lib/global-store";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, RefreshCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function RecycleBinPage() {
  const { goals, todos, activities, notes, courses, restoreItem, permanentlyDeleteItem } = useGlobalStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const deletedItems = [
    ...goals.filter(g => g.isDeleted).map(g => ({ ...g, itemType: 'goal', displayTitle: g.title })),
    ...todos.filter(t => t.isDeleted).map(t => ({ ...t, itemType: 'todo', displayTitle: t.title })),
    ...activities.filter(a => a.isDeleted).map(a => ({ ...a, itemType: 'activity', displayTitle: a.name })),
    ...notes.filter(n => n.isDeleted).map(n => ({ ...n, itemType: 'note', displayTitle: n.title })),
    ...courses.filter(c => c.isDeleted).map(c => ({ ...c, itemType: 'course', displayTitle: c.name }))
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Recycle Bin</h1>
        <p className="text-muted-foreground mt-2">Manage your deleted items. Items older than 7 days are automatically removed.</p>
      </div>
      
      {!mounted ? null : deletedItems.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-card/10">
          <Trash className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p>Your recycle bin is empty.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {deletedItems.map((item) => (
            <Card key={`${item.itemType}-${item.id}`} className="flex flex-col shadow-sm border-border bg-card">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <Badge variant="secondary" className="capitalize mb-2">{item.itemType}</Badge>
                </div>
                <CardTitle className="text-lg">{item.displayTitle}</CardTitle>
                {item.deletedAt && (
                  <CardDescription>Deleted on: {new Date(item.deletedAt).toLocaleDateString()}</CardDescription>
                )}
              </CardHeader>
              <div className="flex-1" />
              <CardFooter className="flex justify-end gap-2 pt-2 pb-4">
                <Button variant="outline" size="sm" onClick={() => restoreItem(item.itemType as 'goal' | 'todo' | 'activity' | 'note' | 'course', item.id)}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Restore
                </Button>
                <Button variant="destructive" size="sm" onClick={() => permanentlyDeleteItem(item.itemType as 'goal' | 'todo' | 'activity' | 'note' | 'course', item.id)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
