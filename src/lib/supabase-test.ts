import { supabase } from './supabase';

export async function testSupabaseConnection() {
  console.log('Testing Supabase connection...');
  
  try {
    // Test basic connection
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    console.log('Connection test result:', { testData, testError });
    
    if (testError) {
      console.error('Connection failed:', testError);
      return false;
    }
    
    // Test orders table
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    console.log('Orders table test:', { ordersData, ordersError });
    
    // Test customers table
    const { data: customersData, error: customersError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5);
    
    console.log('Customers table test:', { 
      count: customersData?.length || 0, 
      error: customersError,
      sampleData: customersData?.slice(0, 2)
    });
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}
