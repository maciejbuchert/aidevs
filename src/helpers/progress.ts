
export function printProgress(message: string, progress: number){
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write( `${message} - ${progress}%`);
}
