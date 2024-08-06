import 'react-native-url-polyfill';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://atsmtqsjicbbwbaogpma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0c210cXNqaWNiYndiYW9ncG1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTg2NjM1MjYsImV4cCI6MjAzNDIzOTUyNn0.FqjcFZOKcoFKAgu6E0Cm7WvI4lX8OQMIbJU_zInsQCw';

export const supabase = createClient(supabaseUrl, supabaseKey);

