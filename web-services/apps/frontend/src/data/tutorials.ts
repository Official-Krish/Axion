export interface Tutorial {
  n: string;
  time: string;
  tag: "Beginner" | "Intermediate" | "Advanced";
  slug: string;
  title: string;
  desc: string;
  content: string[];
}

export const TUTORIALS: Tutorial[] = [
  {
    n: "01",
    time: "5 min",
    tag: "Beginner",
    slug: "deploy-first-vm",
    title: "Deploy your first VM",
    desc: "Connect wallet, pick a spec, confirm SOL escrow. Your first machine is running in under 30 seconds.",
    content: [
      'Navigate to the Compute page and click "Rent VM" to begin.',
      "Connect your Solana wallet using the wallet adapter in the top-right corner. Make sure you have a small amount of SOL for the escrow deposit.",
      "Choose your machine configuration: select a region close to your users, pick a machine type (e2-micro for light workloads, e2-standard for heavier tasks), and set your disk size.",
      "Select an operating system image. Ubuntu 22.04 is recommended for general use. Debian and CentOS are also available.",
      "Choose a payment method: Duration-based (pay upfront for a set period) or Escrow-based (pay as you go with funds held in escrow).",
      "Review the pricing summary and confirm the transaction in your wallet. The SOL amount includes the compute cost plus a small escrow deposit.",
      "Wait for the on-chain confirmation. Once the transaction is finalized, your VM will be provisioned within seconds.",
      "Your new VM appears on the Dashboard. Click on it to view details, get the IP address, and access SSH credentials.",
    ],
  },
  {
    n: "02",
    time: "3 min",
    tag: "Beginner",
    slug: "set-up-ssh",
    title: "Set up SSH access",
    desc: "Retrieve your ephemeral key, connect via terminal. This guide walks you through the first session.",
    content: [
      "From your VM detail page, locate the IP address displayed in the Overview section.",
      'Click "Copy IP Address" in the Quick Actions sidebar to copy it to your clipboard.',
      "Open a terminal on your local machine. Use the following command to connect: ssh root@<vm-ip-address>",
      "When prompted, enter the password displayed on the VM detail page under the SSH section. This password is auto-generated and unique to your VM.",
      "For enhanced security, you can add your own SSH public key. Edit the ~/.ssh/authorized_keys file on the VM and paste your public key.",
      'To use the browser-based terminal, click "Open in Browser" from the VM detail page sidebar. This opens a web terminal with zero configuration needed.',
      "The browser terminal supports copy/paste with Ctrl+Shift+C and Ctrl+Shift+V (Mac: Cmd+Shift+C/V).",
      "When you're done, type exit or close the tab. Your VM continues running until you explicitly delete it from the Dashboard.",
    ],
  },
  {
    n: "03",
    time: "10 min",
    tag: "Intermediate",
    slug: "register-depin-host",
    title: "Register a DePIN host node",
    desc: "Install the verification script, register on-chain, activate your machine and watch rewards accumulate.",
    content: [
      "Ensure your machine meets the minimum requirements: 4+ CPU cores, 8+ GB RAM, 50+ GB disk, and a static public IP address.",
      'Navigate to the Host page and click "Register Machine" to start the registration process.',
      "The system generates a unique verification script for your machine. Copy the provided command.",
      "SSH into the machine you want to register as a host node and paste the verification script. This script checks hardware specs, network latency, and disk performance.",
      "The verification process takes 2-3 minutes. The script reports results back to the Axion network. Do not close the SSH session during verification.",
      "Once verification passes, your machine appears in the Host Dashboard. Review the reported specs and confirm they match your hardware.",
      "Activate the host node from the dashboard. This initiates the on-chain registration, locking a small amount of SOL as a commitment bond.",
      "After activation, your node begins accepting compute workloads. Rewards accumulate in real-time based on resource utilization.",
      "Monitor your earnings from the Rewards page. Withdraw accrued SOL at any time with no minimum threshold.",
    ],
  },
  {
    n: "04",
    time: "7 min",
    tag: "Intermediate",
    slug: "deploy-docker-image",
    title: "Deploy a Docker image",
    desc: "Push a container to the DePIN network. Covers image selection, port mapping, and environment variables.",
    content: [
      'From the Dashboard, click "Deploy App" or navigate directly to the Docker Deploy page.',
      "Enter the Docker image name. Use a public image from Docker Hub (e.g., nginx:latest, node:18-alpine) or a custom image from a private registry.",
      "Specify resource requirements: CPU cores, RAM, and disk space. The minimum is 1 CPU core, 1 GB RAM, and 10 GB disk.",
      "Configure port mappings. Specify which container port should be exposed (e.g., map container port 80 to the host). Only one port can be exposed per deployment.",
      "Add environment variables if needed. These are passed to the container at runtime. Common examples include DATABASE_URL, API_KEY, and NODE_ENV.",
      "Set the escrow amount — this covers the compute cost for the deployment duration. Higher resource requirements need a larger escrow.",
      "Review your configuration and confirm the transaction in your wallet. The deployment is submitted on-chain.",
      "Once confirmed, the deployment appears in your Dashboard. Access your app via the displayed URL or IP address once the container is running.",
    ],
  },
  {
    n: "05",
    time: "2 min",
    tag: "Beginner",
    slug: "claim-sol-rewards",
    title: "Claim earned SOL rewards",
    desc: "Open the rewards panel, select machines with pending balance, and initiate a single claim transaction.",
    content: [
      "Navigate to the Rewards page from the main navigation or your Host Dashboard.",
      "The rewards panel displays all your registered host machines and their pending SOL balances.",
      "Machines with available rewards show a positive balance in SOL. The balance updates in near real-time as workloads are processed.",
      "Select the machines you want to claim from by checking the box next to each machine. You can claim from multiple machines in a single transaction.",
      'Click "Claim Rewards" to initiate the on-chain claim transaction. Your wallet prompts you to approve the transaction.',
      "The claim transaction transfers accumulated rewards from the DePIN rewards pool to your connected wallet.",
      "After confirmation, the claimed SOL appears in your wallet balance. The rewards counter for each selected machine resets to zero.",
      "There is no minimum claim amount and no fee for claiming. Claim as often as you'd like.",
    ],
  },
  {
    n: "06",
    time: "4 min",
    tag: "Advanced",
    slug: "escrow-contract",
    title: "Understand the escrow contract",
    desc: "Walk through the Anchor program logic: how funds are locked, metered, and released after session end.",
    content: [
      "The Axion escrow system uses a Solana Anchor program deployed on devnet. The program manages fund locking, metering, and release.",
      "When you rent a VM, SOL is transferred from your wallet to a program-derived vault account. This vault is unique to each user and seeded with a global vault seed.",
      "Each rental session creates a Rental Session PDA (Program Derived Address). This PDA tracks session-specific data including the VM ID, user public key, timestamps, and the locked amount.",
      "For Duration-based rentals, the full amount is locked upfront. The program calculates the rental period and releases funds to the platform proportionally as time elapses.",
      "For Escrow-based rentals, funds are deposited into escrow. The program meters resource usage in real-time. At session end, unused funds are returned to the user.",
      "The top_up_escrow instruction allows users to add more funds to an active escrow session without creating a new rental. Useful for long-running workloads.",
      "When a rental session ends (via end_rental_session or finalise_rental_with_escrow), the program calculates the final cost. Any surplus is returned to the user's wallet.",
      "The force_terminate_rental instruction provides an admin backstop for terminating stuck sessions. Only the program admin can invoke this instruction.",
      "Security: The vault uses a PDA with seed constraints to prevent unauthorized withdrawals. All instructions verify the signer matches the session's recorded public key.",
    ],
  },
];

export const TAG_COLOR: Record<string, string> = {
  Beginner: "text-emerald-500",
  Intermediate: "text-[#9945FF]",
  Advanced: "text-amber-500",
};

export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return TUTORIALS.find((t) => t.slug === slug);
}
