// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { useState } from "react";
import type { Category } from "@prisma/client";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  onConfirm: () => void;
  isPending: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────
// Implements cognitive friction: user must type the record ID to confirm
// irreversible hard deletion. The confirm button stays disabled until match.
export function CategoryDeleteDialog({
  open,
  onOpenChange,
  category,
  onConfirm,
  isPending,
}: CategoryDeleteDialogProps) {
  const t = useTranslations("categories");
  const [confirmInput, setConfirmInput] = useState("");

  // Reset input whenever dialog opens/closes
  function handleOpenChange(next: boolean) {
    if (!next) setConfirmInput("");
    onOpenChange(next);
  }

  const confirmIdentifier = category?.id ?? "";
  // Show only last 8 chars for readability (like "...xYz12AbC")
  const shortId = confirmIdentifier.length > 8
    ? `...${confirmIdentifier.slice(-8)}`
    : confirmIdentifier;
  const isMatch = confirmInput === confirmIdentifier;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-destructive">
                {t("delete_dialog.title")}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {t("delete_dialog.description", { name: category?.name ?? "" })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning message */}
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <p className="text-sm text-destructive">
              {t("delete_dialog.warning")}
            </p>
          </div>

          {/* Transcription challenge */}
          <div className="space-y-2">
            <Label htmlFor="confirm-delete" className="text-sm">
              {t("delete_dialog.challenge", { id: shortId })}
            </Label>
            <Input
              id="confirm-delete"
              placeholder={confirmIdentifier}
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              className={
                confirmInput.length > 0 && !isMatch
                  ? "border-destructive focus-visible:ring-destructive"
                  : ""
              }
              autoComplete="off"
              aria-describedby="confirm-delete-hint"
            />
            <p id="confirm-delete-hint" className="text-xs text-muted-foreground">
              {t("delete_dialog.hint")}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            {t("actions.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={!isMatch || isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            {t("delete_dialog.confirm_button")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
