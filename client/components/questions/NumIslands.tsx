export const NumIslands = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Number of Islands</h1>
      <div className="space-y-4">
        <p>
          <strong>Problem:</strong> Given an m x n 2D binary grid grid which represents a map of
          &apos;1&apos;s (land) and &apos;0&apos;s (water), return the number of islands.
        </p>
        <p>
          An island is surrounded by water and is formed by connecting adjacent lands horizontally
          or vertically. You may assume all four edges of the grid are all surrounded by water.
        </p>
        <div>
          <strong>Example 1:</strong>
          <br />
          <strong>Input:</strong> grid = [
          [&apos;1&apos;,&apos;1&apos;,&apos;1&apos;,&apos;1&apos;,&apos;0&apos;],
          [&apos;1&apos;,&apos;1&apos;,&apos;0&apos;,&apos;1&apos;,&apos;0&apos;],
          [&apos;1&apos;,&apos;1&apos;,&apos;0&apos;,&apos;0&apos;,&apos;0&apos;],
          [&apos;0&apos;,&apos;0&apos;,&apos;0&apos;,&apos;0&apos;,&apos;0&apos;] ]
          <br />
          <strong>Output:</strong> 1
        </div>
        <div>
          <strong>Example 2:</strong>
          <br />
          <strong>Input:</strong> grid = [
          [&apos;1&apos;,&apos;1&apos;,&apos;0&apos;,&apos;0&apos;,&apos;0&apos;],
          [&apos;1&apos;,&apos;1&apos;,&apos;0&apos;,&apos;0&apos;,&apos;0&apos;],
          [&apos;0&apos;,&apos;0&apos;,&apos;1&apos;,&apos;0&apos;,&apos;0&apos;],
          [&apos;0&apos;,&apos;0&apos;,&apos;0&apos;,&apos;1&apos;,&apos;1&apos;] ]
          <br />
          <strong>Output:</strong> 3
        </div>
        <div>
          <strong>Constraints:</strong>
          <br />
          m == grid.length
          <br />
          n == grid[i].length
          <br />
          1 &lt;= m, n &lt;= 300
          <br />
          grid[i][j] is &apos;0&apos; or &apos;1&apos;.
        </div>
      </div>
    </div>
  );
};
