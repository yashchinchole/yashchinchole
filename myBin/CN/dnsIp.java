import java.net.*;
import java.util.*;

public class dnsIp {
    public static void main(String[] args) {
        String host;
        Scanner input = new Scanner(System.in);
        System.out.print("Enter IP Address : ");
        host = input.nextLine();
        input.close();

        try {
            InetAddress address = InetAddress.getByName(host);
            System.out.println("Host Name : " + address.getHostName());
        } catch (UnknownHostException ex) {
            System.out.println("Could Not Find " + host);
        }
    }
}