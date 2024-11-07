"use client";

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  MdPerson,
  MdDescription,
  MdContactSupport,
  MdFeedback,
} from "react-icons/md";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
}: SettingsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[300px] bg-zinc-900 text-white border-l border-zinc-800"
      >
        <SheetHeader className="text-center space-y-1">
          <SheetTitle className="text-2xl font-bold text-white">
            LaSo
          </SheetTitle>
          <SheetDescription className="text-zinc-400">
            Settings & Configuration
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-800 text-white"
          >
            <MdPerson className="h-5 w-5" />
            Account Details
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-800 text-white"
          >
            <MdDescription className="h-5 w-5" />
            Terms of Service
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-800 text-white"
          >
            <MdContactSupport className="h-5 w-5" />
            Contact Us
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-800 text-white"
          >
            <MdFeedback className="h-5 w-5" />
            Feedback
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
