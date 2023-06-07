import java.net.*;
import java.util.*;

public class dnsHost {
    public static void main(String[] args) {
        String host;
        Scanner input = new Scanner(System.in);
        System.out.print("Enter Host Name : ");
        host = input.nextLine();
        input.close();

        try {
            InetAddress address = InetAddress.getByName(host);
            System.out.print("IP Address : " + address.getHostAddress());
        } catch (UnknownHostException ex) {
            System.out.print("Could Not Found : " + host);
        }
    }
}