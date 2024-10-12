import 'react-native-url-polyfill';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = '';
const supabaseKey = '';

export const supabase = createClient(supabaseUrl, supabaseKey);

