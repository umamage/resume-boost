import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Lightbulb, Briefcase } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { ResumeUpload } from '@/components/ResumeUpload';
import { ScoreCircle } from '@/components/ScoreCircle';
import { JobCard } from '@/components/JobCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api, ResumeScore, Job } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [authLoading, isAuthenticated, navigate]);
  
  const handleUpload = async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    
    try {
      const score = await api.analyzeResume(file);
      setResumeScore(score);
      
      toast({
        title: 'Resume analyzed!',
        description: `Your resume scored ${score.overall}/100`,
      });
      
      // Load job recommendations
      setIsLoadingJobs(true);
      const jobList = await api.getJobRecommendations(score);
      setJobs(jobList);
    } catch (error) {
      toast({
        title: 'Analysis failed',
        description: 'Could not analyze your resume. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      setIsLoadingJobs(false);
    }
  };
  
  const handleApply = async (jobId: string) => {
    const result = await api.applyToJob(jobId);
    toast({
      title: result.success ? 'Application sent!' : 'Application failed',
      description: result.message,
      variant: result.success ? 'default' : 'destructive',
    });
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload your resume to get personalized job recommendations
          </p>
        </div>
        
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left column - Upload & Score */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="font-display text-lg">Resume Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <ResumeUpload
                  onUpload={handleUpload}
                  isUploading={isUploading}
                  uploadedFile={uploadedFile}
                />
              </CardContent>
            </Card>
            
            {resumeScore && (
              <Card className="glass-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Resume Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ScoreCircle score={resumeScore.overall} size="lg" />
                  
                  <div className="w-full mt-6 space-y-3">
                    {Object.entries(resumeScore.categories).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {key}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-8 text-right">{value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {resumeScore && (
              <Card className="glass-card animate-fade-in">
                <CardHeader>
                  <CardTitle className="font-display text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-warning" />
                    Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {resumeScore.suggestions.map((suggestion, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <Badge variant="outline" className="h-5 w-5 shrink-0 flex items-center justify-center text-xs">
                          {i + 1}
                        </Badge>
                        <span className="text-muted-foreground">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Right column - Jobs */}
          <div className="lg:col-span-2">
            <Card className="glass-card h-full">
              <CardHeader>
                <CardTitle className="font-display text-lg flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Recommended Jobs
                  {jobs.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {jobs.length} matches
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingJobs ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : jobs.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {jobs.map((job, i) => (
                      <div key={job.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                        <JobCard job={job} onApply={handleApply} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Briefcase className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Upload your resume to see personalized job recommendations
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
