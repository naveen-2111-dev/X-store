import { useInstance } from "./useInstance";

export async function useContract({ functionName }) {
  const contract = await useInstance();

  const executeTransaction = async (...args) => {
    if (!contract) {
      console.error("Contract is not initialized yet");
      return;
    }

    if (!functionName) {
      console.error("Function name is undefined or null.");
      return;
    }

    if (
      !contract[functionName] ||
      typeof contract[functionName] !== "function"
    ) {
      console.error(`Function "${functionName}" is not found in the contract.`);
      return;
    }

    try {
      console.log(`Calling function: ${functionName} with args:`, args);
      const result = await contract[functionName](...args);

      if (result.wait) {
        await result.wait();
        return result;
      }

      return result;
    } catch (error) {
      console.error("Contract call error:", error);
    }
  };

  return executeTransaction;
}
