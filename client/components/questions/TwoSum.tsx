export const TwoSum = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">1. Two Sum</h1>
      <div className="space-y-4">
        <p>
          <strong>Problem:</strong> Given an array of integers nums and an integer target, return
          indices of the two numbers such that they add up to target.
        </p>
        <p>
          You may assume that each input would have exactly one solution, and you may not use the
          same element twice. You can return the answer in any order.
        </p>
        <div>
          <strong>Example 1:</strong>
          <br />
          <strong>Input:</strong> nums = [2,7,11,15], target = 9
          <br />
          <strong>Output:</strong> [0,1]
          <br />
          <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
        </div>
        <div>
          <strong>Example 2:</strong>
          <br />
          <strong>Input:</strong> nums = [3,2,4], target = 6
          <br />
          <strong>Output:</strong> [1,2]
        </div>
        <div>
          <strong>Example 3:</strong>
          <br />
          <strong>Input:</strong> nums = [3,3], target = 6
          <br />
          <strong>Output:</strong> [0,1]
        </div>
        <p>
          <strong>Task:</strong> Implement the two sum solution.
        </p>
      </div>
    </div>
  );
};
