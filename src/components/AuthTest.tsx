import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const AuthTest = () => {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing...');
    
    try {
      // Test 1: Basic database connectivity
      const { data: dbTest, error: dbError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (dbError) {
        setTestResult(`DB Error: ${dbError.message}`);
        setIsLoading(false);
        return;
      }
      
      setTestResult('Database connection: ✅');
      
      // Test 2: Auth endpoint connectivity
      try {
        const response = await fetch(`https://ztrseijpesnmztuugmsi.supabase.co/auth/v1/health`);
        if (response.ok) {
          setTestResult(prev => prev + '\nAuth endpoint: ✅');
        } else {
          setTestResult(prev => prev + `\nAuth endpoint: ❌ (${response.status})`);
        }
      } catch (fetchError) {
        setTestResult(prev => prev + `\nAuth endpoint: ❌ (${fetchError})`);
      }
      
    } catch (error) {
      setTestResult(`Connection test failed: ${error}`);
    }
    
    setIsLoading(false);
  };

  const testSignup = async () => {
    setIsLoading(true);
    setTestResult('Testing signup...');
    
    const testEmail = `test+${Date.now()}@example.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: 'testpassword123',
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      });
      
      if (error) {
        setTestResult(`Signup Error: ${error.message}`);
      } else {
        setTestResult(`Signup Success: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setTestResult(`Signup Exception: ${error}`);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="p-4 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Supabase Connection Test</h3>
      <div className="space-y-4">
        <Button onClick={testConnection} disabled={isLoading}>
          Test Basic Connection
        </Button>
        <Button onClick={testSignup} disabled={isLoading}>
          Test Signup
        </Button>
        {testResult && (
          <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-64">
            {testResult}
          </pre>
        )}
      </div>
    </div>
  );
};

export default AuthTest;