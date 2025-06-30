exports.handler = async (event, context) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] Hello from the PLAIN JAVASCRIPT file!`);
    console.log('If you see this log, the problem is 100% the TypeScript build process.');
    console.log('We can now fix it.');
  
    return {
      statusCode: 200,
      body: 'Plain JavaScript function executed successfully.',
    };
};