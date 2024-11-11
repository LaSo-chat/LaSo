"use client";
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
  MdLogout,
} from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signOut } from "../services/authService";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
}: SettingsDrawerProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(dispatch); // Pass dispatch as an argument
      navigate("/login"); // Redirect after logging out
    } catch (error) {
      console.error("Failed to log out:", (error as Error).message);
      alert("Failed to log out. Please try again.");
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[300px] text-white border-l border-zinc-800"
        style={{ backgroundColor: "#001027" }}
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
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-600 text-white hover:text-white"
            onClick={() => navigate("/account")}
          >
            <MdPerson className="h-5 w-5" />
            Account Details
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-600 text-white hover:text-white"
            onClick={() => navigate("/termsofservice")}
          >
            <MdDescription className="h-5 w-5" />
            Terms of Service
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-600 text-white hover:text-white"
            onClick={() => navigate("/contactus")}
          >
            <MdContactSupport className="h-5 w-5" />
            Contact Us
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-600 text-white hover:text-white"
            onClick={() => navigate("/feedback")}
          >
            <MdFeedback className="h-5 w-5" />
            Feedback
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-11 px-4 hover:bg-zinc-600 text-white hover:text-white"
            onClick={handleLogout}
          >
            <MdLogout className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
