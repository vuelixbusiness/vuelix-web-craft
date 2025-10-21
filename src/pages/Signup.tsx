import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { LocationSetupDialog } from "@/components/LocationSetupDialog";
import { USER_TYPES, getUserTypeById } from "@/config/userTypes";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, signInWithGoogle, signInWithMicrosoft, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1 = user type selection, 2 = account details
  const [selectedUserType, setSelectedUserType] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreedToTerms: false,
  });

  const handleUserTypeSelect = (userType: string) => {
    setSelectedUserType(userType);
  };

  const handleContinueToForm = () => {
    if (!selectedUserType) {
      toast.error("Please select a user type");
      return;
    }
    setStep(2);
  };

  const handleBackToUserTypes = () => {
    setStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!formData.username.trim()) {
      toast.error("Username is required");
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error("Username must be between 3 and 20 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      toast.error("Username can only contain letters, numbers, and underscores");
      return;
    }

    if (!selectedUserType) {
      toast.error("Please select a user type");
      return;
    }

    const result = await signup(
      formData.email,
      formData.password,
      formData.fullName,
      formData.username,
      selectedUserType
    );

    if (result.success && result.userId) {
      const userTypeLabel = getUserTypeById(selectedUserType)?.label || selectedUserType;
      toast.success(`Welcome to Vuelix! Account created successfully as ${userTypeLabel}`);
      setNewUserId(result.userId);
      setShowLocationDialog(true);
    } else {
      toast.error("Signup failed. Please try again");
    }
  };

  const handleLocationComplete = () => {
    setShowLocationDialog(false);
    
    // Route based on user type
    if (selectedUserType === 'artist' || selectedUserType === 'record_label' || selectedUserType === 'festival_event') {
      navigate('/artist-dashboard');
    } else if (selectedUserType === 'creator' || selectedUserType === 'visual_creative' || selectedUserType === 'dj' || selectedUserType === 'producer') {
      navigate('/creator-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      toast.error(result.error || "Unable to sign in with Google. Please try again.");
    }
  };

  const handleMicrosoftSignIn = async () => {
    const result = await signInWithMicrosoft();
    if (!result.success) {
      toast.error(result.error || "Unable to sign in with Microsoft. Please try again.");
    }
  };

  // Step 1: User Type Selection
  if (step === 1) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/10">
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-4 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Join the Vuelix Ecosystem
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose your role and start your journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USER_TYPES.map((userType, index) => (
              <button
                key={userType.id}
                onClick={() => handleUserTypeSelect(userType.id)}
                className={`
                  group relative p-6 rounded-lg border-2 transition-all duration-300
                  hover:scale-105 hover:shadow-lg animate-fade-in
                  ${selectedUserType === userType.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border bg-card hover:border-primary/50'
                  }
                `}
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="text-5xl">{userType.icon}</div>
                  <h3 className="text-xl font-bold">{userType.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {userType.description}
                  </p>
                </div>
                {selectedUserType === userType.id && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                      <span className="text-primary-foreground text-xs">✓</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>

          {selectedUserType && (
            <div className="flex justify-center animate-fade-in">
              <Button
                size="lg"
                onClick={handleContinueToForm}
                className="px-8"
              >
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Step 2: Account Details Form
  const selectedType = getUserTypeById(selectedUserType!);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToUserTypes}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          {selectedType && (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <span className="text-3xl">{selectedType.icon}</span>
              <div>
                <p className="text-sm text-muted-foreground">Signing up as</p>
                <p className="font-semibold">{selectedType.label}</p>
              </div>
            </div>
          )}
          <CardTitle className="text-2xl font-bold text-center pt-4">
            Create your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your details to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreedToTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreedToTerms: checked as boolean })
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleMicrosoftSignIn}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23">
                  <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                  <path fill="#f35325" d="M1 1h10v10H1z" />
                  <path fill="#81bc06" d="M12 1h10v10H12z" />
                  <path fill="#05a6f0" d="M1 12h10v10H1z" />
                  <path fill="#ffba08" d="M12 12h10v10H12z" />
                </svg>
                Microsoft
              </Button>
            </div>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {showLocationDialog && newUserId && (
        <LocationSetupDialog
          open={showLocationDialog}
          userId={newUserId}
          onComplete={handleLocationComplete}
        />
      )}
    </div>
  );
};

export default Signup;
