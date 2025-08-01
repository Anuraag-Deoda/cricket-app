import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCricketStore } from "@/store/cricket-store";

export default function CommentaryInterface() {
  const { commentary } = useCricketStore();
  const [commentaryStyle, setCommentaryStyle] = useState<'hindi' | 'english' | 'technical'>('hindi');
  const [aiProvider, setAiProvider] = useState<'gemini' | 'gpt4'>('gemini');
  const [autoGenerate, setAutoGenerate] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-microphone text-cricket-primary mr-2"></i>
              AI Commentary Feed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {commentary.feed.length > 0 ? (
                commentary.feed.map((comment) => (
                  <div key={comment.id} className={`p-4 border-l-4 rounded-r-lg ${
                    comment.provider === 'gemini' 
                      ? 'border-cricket-primary bg-cricket-bg' 
                      : 'border-cricket-accent bg-blue-50'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-source-code text-sm text-cricket-gray">{comment.over}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded text-white ${
                          comment.provider === 'gemini' ? 'bg-cricket-primary' : 'bg-cricket-accent'
                        }`}>
                          {comment.provider === 'gemini' ? 'Gemini AI' : 'GPT-4o'}
                        </span>
                        <span className="text-xs text-cricket-gray">
                          {comment.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm italic">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-cricket-gray">
                  <i className="fas fa-microphone-slash text-4xl mb-4"></i>
                  <p>No commentary generated yet</p>
                  <p className="text-sm">Start scoring to see AI commentary!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Commentary Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-cog text-cricket-primary mr-2"></i>
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="commentary-style" className="text-sm font-medium text-cricket-gray mb-2 block">
                  Commentary Style
                </Label>
                <Select value={commentaryStyle} onValueChange={(value) => setCommentaryStyle(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hindi">Energetic Hindi</SelectItem>
                    <SelectItem value="english">Balanced English</SelectItem>
                    <SelectItem value="technical">Technical Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label className="text-sm font-medium text-cricket-gray mb-3 block">AI Provider</Label>
                <RadioGroup value={aiProvider} onValueChange={(value) => setAiProvider(value as any)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gemini" id="gemini" />
                    <Label htmlFor="gemini" className="text-sm">Gemini Pro (Primary)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gpt4" id="gpt4" />
                    <Label htmlFor="gpt4" className="text-sm">GPT-4o (Key Moments)</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-generate" className="text-sm font-medium text-cricket-gray">
                  Auto-generate
                </Label>
                <Switch
                  id="auto-generate"
                  checked={autoGenerate}
                  onCheckedChange={setAutoGenerate}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Commentary Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-chart-bar text-cricket-primary mr-2"></i>
              Commentary Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-cricket-gray">Total Comments:</span>
                <span className="font-semibold">{commentary.feed.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cricket-gray">Gemini Calls:</span>
                <span className="font-semibold">
                  {commentary.feed.filter(c => c.provider === 'gemini').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cricket-gray">GPT-4o Calls:</span>
                <span className="font-semibold">
                  {commentary.feed.filter(c => c.provider === 'gpt4').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-cricket-gray">Token Usage:</span>
                <span className="font-semibold">
                  {(commentary.feed.length * 150).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <i className="fas fa-bolt text-cricket-primary mr-2"></i>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full bg-cricket-primary hover:bg-green-600">
                <i className="fas fa-microphone mr-2"></i>
                Generate Commentary
              </Button>
              <Button variant="outline" className="w-full">
                <i className="fas fa-download mr-2"></i>
                Export Commentary
              </Button>
              <Button variant="outline" className="w-full">
                <i className="fas fa-trash mr-2"></i>
                Clear Feed
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
