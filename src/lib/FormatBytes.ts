export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const units = ['Bytes', 'KB', 'MB', 'GB'];

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
    const unitIndex = Math.min(i, units.length - 1);
  
    const value = bytes / Math.pow(1024, unitIndex);
  
    const formattedValue = parseFloat(value.toFixed(1));

    return `${formattedValue} ${units[unitIndex]}`;
}