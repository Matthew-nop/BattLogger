import * as fs from 'fs';
import * as path from 'path';

export enum LOG_LEVEL {
	DEBUG = 0,
	INFO = 1,
	WARN = 2,
	ERROR = 3,
	FATAL = 4,
}

export class LoggingManager {
	private static instance: LoggingManager;
	private logFilePath: string;
	private currentLogLevel: LOG_LEVEL;

	private constructor() {
		const logDir = path.join(process.cwd(), 'logs');
		if (!fs.existsSync(logDir)) {
			fs.mkdirSync(logDir, { recursive: true });
		}
		this.logFilePath = path.join(logDir, 'app.log');

		const logLevelFromEnv = process.env.LOG_LEVEL?.toUpperCase();
		this.currentLogLevel = LOG_LEVEL.INFO; // Default log level

		if (logLevelFromEnv && LOG_LEVEL[logLevelFromEnv as keyof typeof LOG_LEVEL] !== undefined) {
			this.currentLogLevel = LOG_LEVEL[logLevelFromEnv as keyof typeof LOG_LEVEL];
		}
	}

	public static getInstance(): LoggingManager {
		if (!LoggingManager.instance) {
			LoggingManager.instance = new LoggingManager();
		}
		return LoggingManager.instance;
	}

	public setLogLevel(level: LOG_LEVEL): void {
		this.currentLogLevel = level;
	}

	private consoleLog(message: string, level: LOG_LEVEL): void {
		if (process.env.NODE_ENV?.toUpperCase() === 'DEV') {
			console.log(`[${LOG_LEVEL[level]}] ${message}`);
		}
	}

	public async log(level: LOG_LEVEL, message: string): Promise<void> {
		if (level < this.currentLogLevel) {
			return; // Do not log if the message level is below the current log level
		}

		const timestamp = new Date().toISOString();
		const logEntry = `[${timestamp}] [${LOG_LEVEL[level]}] ${message}\n`;

		this.consoleLog(message, level); // Log to console if in dev mode

		return new Promise<void>((resolve, reject) => {
			fs.appendFile(this.logFilePath, logEntry, (err) => {
				if (err) {
					console.error('Error writing to log file:', err);
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}
}
