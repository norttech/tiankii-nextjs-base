// @ts-nocheck — Reference/example file only. Not compiled. Do NOT copy this line into generated modules.
"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Category } from "@prisma/client";
import { CreateCategorySchema, type CreateCategory } from "@/lib/schemas/category/category.schema";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  category: Category | null;
  onSuccess: () => void;
}

// ─── Mobile Step Definition ──────────────────────────────────────────────────
interface FormStep {
  id: string;
  label: string;
  fields: string[];
}

const FORM_STEPS: FormStep[] = [
  { id: "basic", label: "step_basic", fields: ["name", "description"] },
  { id: "appearance", label: "step_appearance", fields: ["color"] },
];

// ─── Custom hook: useMediaQuery ──────────────────────────────────────────────
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// ─── Component ───────────────────────────────────────────────────────────────
export function CategoryDrawer({
  open,
  onOpenChange,
  mode,
  category,
  onSuccess,
}: CategoryDrawerProps) {
  const t = useTranslations("categories");
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<CreateCategory>({
    resolver: zodResolver(CreateCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#000000",
    },
  });

  // Pre-populate form on edit mode
  useEffect(() => {
    if (mode === "edit" && category) {
      form.reset({
        name: category.name,
        description: category.description ?? "",
        color: category.color ?? "#000000",
      });
    } else if (mode === "create") {
      form.reset({
        name: "",
        description: "",
        color: "#000000",
      });
    }
    setCurrentStep(0);
  }, [mode, category, form, open]);

  // ── Mutations ───────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (data: CreateCategory) =>
      fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to create");
        return res.json();
      }),
    onSuccess: () => {
      toast.success(t("notifications.created"));
      onSuccess();
    },
    onError: () => toast.error(t("notifications.error")),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateCategory) =>
      fetch(`/api/categories/${category!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((res) => {
        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      }),
    onSuccess: () => {
      toast.success(t("notifications.updated"));
      onSuccess();
    },
    onError: () => toast.error(t("notifications.error")),
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(data: CreateCategory) {
    if (mode === "edit") {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  }

  // ── Multi-step validation for mobile ────────────────────────────────────
  async function handleNextStep() {
    const stepFields = FORM_STEPS[currentStep].fields as Array<keyof CreateCategory>;
    const isValid = await form.trigger(stepFields);
    if (isValid) {
      setCurrentStep((s) => Math.min(s + 1, FORM_STEPS.length - 1));
    }
  }

  function handlePrevStep() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  const isLastStep = currentStep === FORM_STEPS.length - 1;

  // ── Render a single form field ──────────────────────────────────────────
  function renderField(fieldName: string) {
    switch (fieldName) {
      case "name":
        return (
          <FormField
            key="name"
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("fields.name")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t("placeholders.name")}
                      {...field}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? "name-error" : undefined}
                      className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {fieldState.error && (
                      <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                    )}
                  </div>
                </FormControl>
                <FormMessage id="name-error" />
              </FormItem>
            )}
          />
        );
      case "description":
        return (
          <FormField
            key="description"
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("fields.description")}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder={t("placeholders.description")}
                      {...field}
                      value={field.value ?? ""}
                      aria-invalid={!!fieldState.error}
                      aria-describedby={fieldState.error ? "description-error" : undefined}
                      className={fieldState.error ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {fieldState.error && (
                      <AlertCircle className="absolute right-3 top-2.5 h-4 w-4 text-destructive" />
                    )}
                  </div>
                </FormControl>
                <FormDescription>{t("placeholders.description_hint")}</FormDescription>
                <FormMessage id="description-error" />
              </FormItem>
            )}
          />
        );
      case "color":
        return (
          <FormField
            key="color"
            control={form.control}
            name="color"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>{t("fields.color")}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input
                      type="color"
                      {...field}
                      value={field.value ?? "#000000"}
                      className="h-10 w-14 cursor-pointer border p-1"
                      aria-invalid={!!fieldState.error}
                    />
                    <Input
                      placeholder="#000000"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      className="flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  }

  // ── Desktop: All fields in one column ───────────────────────────────────
  function renderDesktopForm() {
    return (
      <div className="space-y-6">
        {FORM_STEPS.map((step, idx) => (
          <div key={step.id}>
            {idx > 0 && <Separator className="my-6" />}
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              {t(`form.${step.label}`)}
            </h3>
            <div className="space-y-4">
              {step.fields.map(renderField)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Mobile: Multi-step wizard ───────────────────────────────────────────
  function renderMobileForm() {
    const step = FORM_STEPS[currentStep];
    return (
      <div className="space-y-6">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {FORM_STEPS.map((s, idx) => (
            <div
              key={s.id}
              className={`flex items-center justify-center h-8 w-8 rounded-full text-xs font-bold transition-colors ${
                idx === currentStep
                  ? "bg-primary text-primary-foreground"
                  : idx < currentStep
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {idx < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                idx + 1
              )}
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {t(`form.${step.label}`)} — {currentStep + 1}/{FORM_STEPS.length}
        </p>

        {/* Current step fields */}
        <div className="space-y-4">
          {step.fields.map(renderField)}
        </div>

        {/* Step navigation */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            {t("form.previous")}
          </Button>

          {isLastStep ? (
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              {mode === "create" ? t("actions.create") : t("actions.save")}
            </Button>
          ) : (
            <Button type="button" onClick={handleNextStep}>
              {t("form.next")}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-xl w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>
            {mode === "create" ? t("actions.add_new") : t("actions.edit")}
          </SheetTitle>
          <SheetDescription>
            {mode === "create" ? t("form.create_description") : t("form.edit_description")}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isMobile ? renderMobileForm() : renderDesktopForm()}

            {/* Desktop submit */}
            {!isMobile && (
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {t("actions.cancel")}
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {mode === "create" ? t("actions.create") : t("actions.save")}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
