import java.util.Scanner;

import java.util.Scanner;

/**
 * This program prompts the user to enter an integer and then displays whether the number is positive, negative, or zero.
 */
public class Main {

    /**
     * The main method of the program.
     * @param args Command line arguments (not used in this program).
     */
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Entrez un nombre entier: ");
        int nombre = scanner.nextInt();
        scanner.close();

        /*
         * This section checks the integer entered by the user and prints a message indicating whether the number is positive, negative, or zero.
         */
        if (nombre > 0) {
            System.out.println("Le nombre est positif.");
        } else if (nombre < 0) {
            System.out.println("Le nombre est négatif.");
        } else {
            System.out.println("Le nombre est nul.");
        }

    }

}

