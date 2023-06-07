// Explain Code and what is functionality

import java.io.*;
import java.net.*;

public class selectiveRepeatServer {

    static ServerSocket ss;
    static DataInputStream din;
    static DataOutputStream dout;
    
    public static void main(String[] args) throws SocketException {
        try {
            int a[] = { 30, 40, 50, 60, 70, 80, 90, 100 };
            int l = a.length;
            
            ss = new ServerSocket(8011);
            System.out.println("Waiting for Connection");

            Socket client = ss.accept();
            din = new DataInputStream(client.getInputStream());
            dout = new DataOutputStream(client.getOutputStream());
            System.out.println("Number of Packets Sent : " + l);
            dout.write(l);
            dout.flush();

            for (int i = 0; i < l; i++) {
                dout.write(a[i]);
                dout.flush();
            }
            int k = din.read();
            dout.write(a[k]);
            dout.flush();

        } catch (IOException e) {
            System.out.println(e);
        } finally {
            try {
                din.close();
                dout.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}