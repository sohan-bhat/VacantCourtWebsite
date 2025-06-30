exports.handler = async function(event, context) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] EXECUTING FROM CRON.JS`);
    console.log("SUCCESS: If you see this, the deploy and schedule are working.");
  
    return {
      statusCode: 200,
      body: "Cron function ran successfully from cron.js.",
    };
  };