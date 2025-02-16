import { Command } from "commander";
import { Server } from "./server.js";
import open from 'open';

const program = new Command();

program
  .version("0.1.0-alpha.1")
  .description("Contaigents - AI Content Ecosystem")
  .command("develop")
  .description("Start development server with file editing capabilities")
  .action(async () => {
    const server = new Server();
    server.start();
    const url = "http://localhost:3000/editor";
    console.log(`Opening editor at ${url}`);
    await open(url);
  });

program.parse(process.argv);
