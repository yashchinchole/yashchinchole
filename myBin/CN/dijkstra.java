public class dijkstra {
    static final int totalVertex = 9;

    public static void main(String[] args) {

        int graph[][] = new int[][] {
                { -1, 3, -1, -1, -1, -1, -1, 7, -1 },
                { 3, -1, 7, -1, -1, -1, -1, 10, 4 },
                { -1, 7, -1, 6, -1, 2, -1, -1, 1 },
                { -1, -1, 6, -1, 8, 13, -1, -1, 3 },
                { -1, -1, -1, 8, -1, 9, -1, -1, -1 },
                { -1, -1, 2, 13, 9, -1, 4, -1, 5 },
                { -1, -1, -1, -1, -1, 4, -1, 2, 5 },
                { 7, 10, -1, -1, -1, -1, 2, -1, 6 },
                { -1, 4, 1, 3, -1, 5, 5, 6, -1 } };

        dijkstra obj = new dijkstra();
        obj.shortestPath(graph, 0);
    }

    private void shortestPath(int[][] graph, int source) {
        int[] distance = new int[totalVertex];
        Boolean[] setNodeVisit = new Boolean[totalVertex];

        for (int i = 0; i < totalVertex; i++) {
            setNodeVisit[i] = false;
            distance[i] = Integer.MAX_VALUE;
        }

        distance[source] = 0;

        for (int i = 0; i < totalVertex - 1; i++) {
            int x = minimumDistance(distance, setNodeVisit);
            setNodeVisit[x] = true;

            for (int y = 0; y < totalVertex; y++)
                if (!setNodeVisit[y] && graph[x][y] != -1 && distance[x] != Integer.MAX_VALUE
                        && distance[y] > distance[x] + graph[x][y])
                    distance[y] = distance[x] + graph[x][y];
        }

        System.out.println("Shortest Distance from Source to all Nodes");
        for (int i = 0; i < totalVertex; i++)
            System.out.println("To " + i + " the Shortest Distance : " + distance[i]);

    }

    private int minimumDistance(int[] distance, Boolean[] setNodeVisit) {
        int mDistance = Integer.MAX_VALUE;
        int mIndex = -1;

        for (int i = 0; i < totalVertex; i++) {
            if (!setNodeVisit[i] && distance[i] <= mDistance) {
                mDistance = distance[i];
                mIndex = i;
            }
        }
        return mIndex;
    }
}