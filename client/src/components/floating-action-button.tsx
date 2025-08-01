import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="w-14 h-14 bg-cricket-primary hover:bg-green-600 text-white rounded-full shadow-lg"
          >
            <i className="fas fa-plus text-xl"></i>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <i className="fas fa-plus text-cricket-primary mr-2"></i>
              Quick Actions
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center bg-cricket-primary hover:bg-green-600"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-plus-circle text-xl mb-1"></i>
              <span className="text-sm">New Match</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-users text-xl mb-1"></i>
              <span className="text-sm">Add Team</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-user-plus text-xl mb-1"></i>
              <span className="text-sm">Add Player</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              <i className="fas fa-download text-xl mb-1"></i>
              <span className="text-sm">Export Data</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
