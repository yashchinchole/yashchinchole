import java.util.Scanner;

class subnet {
    public static void main(String args[]) {

        Scanner sc = new Scanner(System.in);
        System.out.print("Enter IP Address : ");
        String ip = sc.nextLine();

        String splitIp[] = ip.split("\\.");
        String splitBIp[] = new String[4];
        String bIp = "";

        for (int i = 0; i < 4; i++) {
            splitBIp[i] = appendZeros(Integer.toBinaryString(Integer.parseInt(splitIp[i])));
            bIp += splitBIp[i];
        }
        System.out.println("IP in Binary is " + bIp);

        System.out.print("Enter Number of Addresses : ");
        int n = sc.nextInt();
        int bits = (int) Math.ceil(Math.log(n) / Math.log(2));
        System.out.println("Number of Bits Required for Address : " + bits);

        int mask = 32 - bits;
        System.out.println("Subnet Mask : " + mask);

        int subnet[] = new int[32];
        for (int i = 0; i < 32; i++)
            subnet[i] = (int) bIp.charAt(i) - 48;

        for (int i = 31; i > 31 - bits; i--)
            subnet[i] &= 0;

        String xip[] = { "", "", "", "" };
        for (int i = 0; i < 32; i++)
            xip[i / 8] = new String(xip[i / 8] + subnet[i]);

        System.out.print("Subnet Address : ");
        for (int i = 0; i < 4; i++) {
            System.out.print(Integer.parseInt(xip[i], 2));
            if (i != 3)
                System.out.print(".");
        }
        System.out.println();

        int broadcast[] = new int[32];
        for (int i = 0; i < 32; i++)
            broadcast[i] = (int) bIp.charAt(i) - 48;

        for (int i = 31; i > 31 - bits; i--)
            broadcast[i] |= 1;

        String yip[] = { "", "", "", "" };
        for (int i = 0; i < 32; i++)
            yip[i / 8] = new String(yip[i / 8] + broadcast[i]);

        System.out.print("Broadcast Address : ");
        for (int i = 0; i < 4; i++) {
            System.out.print(Integer.parseInt(yip[i], 2));
            if (i != 3)
                System.out.print(".");
        }
        System.out.println();
        sc.close();
    }

    static String appendZeros(String s) {
        String temp = new String("00000000");
        return temp.substring(s.length()) + s;
    }
}