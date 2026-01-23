import React, { useEffect, useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Removed missing import
import { Activity, Database, Server, HardDrive, AlertCircle, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HealthData {
    status: string;
    components: {
        db?: {
            status: string;
            details?: {
                database: string;
                validationQuery: string;
            };
        };
        redis?: {
            status: string;
            details?: {
                version: string;
            };
        };
        diskSpace?: {
            status: string;
            details?: {
                total: number;
                free: number;
                threshold: number;
                path: string;
                exists: boolean;
            };
        };
        ping?: {
            status: string;
        };
        mail?: {
            status: string;
        }
    };
}

const AdminSystemHealth: React.FC = () => {
    const { t } = useTranslation('admin');
    const [healthData, setHealthData] = useState<HealthData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchHealth = async () => {
        try {
            // In Docker/Production, this might need to go through an API proxy or full URL
            // Assuming frontend passes /actuator request to backend or using absolute URL if configured
            const response = await fetch('http://localhost:8080/actuator/health');
            if (!response.ok) {
                throw new Error('Failed to fetch health data');
            }
            const data = await response.json();
            setHealthData(data);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('System unreachable or offline');
            setHealthData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status: string) => {
        return status === 'UP' ? 'text-green-500' : 'text-red-500';
    };

    const getStatusIcon = (status: string) => {
        return status === 'UP' ? <CheckCircle className="h-5 w-5 text-green-500" /> : <AlertCircle className="h-5 w-5 text-red-500" />;
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Health</h1>
                    <p className="text-muted-foreground mt-1">Real-time application status monitoring.</p>
                </div>
                {lastUpdated && (
                    <span className="text-sm text-muted-foreground">
                        Last updated: {lastUpdated.toLocaleTimeString()}
                    </span>
                )}
            </div>

            {error ? (
                <div className="bg-red-50 border border-red-500 rounded-lg shadow-sm">
                    <div className="pt-6 flex items-center gap-4 p-6">
                        <AlertCircle className="h-8 w-8 text-red-600" />
                        <div>
                            <h3 className="font-semibold text-red-900">Connection Error</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            ) : loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : healthData ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Overall Status */}
                    <div className="bg-white rounded-lg border shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 className="text-sm font-medium">Application Status</h3>
                            <Activity className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="flex items-center gap-2">
                                {getStatusIcon(healthData.status)}
                                <div className={`text-2xl font-bold ${getStatusColor(healthData.status)}`}>
                                    {healthData.status}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Global system availablity</p>
                        </div>
                    </div>

                    {/* Database */}
                    <div className="bg-white rounded-lg border shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 className="text-sm font-medium">Database (PostgreSQL)</h3>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="flex items-center gap-2">
                                {healthData.components.db ? getStatusIcon(healthData.components.db.status) : <AlertCircle className="h-5 w-5 text-gray-400" />}
                                <div className={`text-2xl font-bold ${healthData.components.db ? getStatusColor(healthData.components.db.status) : 'text-gray-400'}`}>
                                    {healthData.components.db?.status || 'UNKNOWN'}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {healthData.components.db?.details?.database || 'Service not detected'}
                            </p>
                        </div>
                    </div>

                    {/* Redis */}
                    <div className="bg-white rounded-lg border shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 className="text-sm font-medium">Cache (Redis)</h3>
                            <Server className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="flex items-center gap-2">
                                {healthData.components.redis ? getStatusIcon(healthData.components.redis.status) : <AlertCircle className="h-5 w-5 text-gray-400" />}
                                <div className={`text-2xl font-bold ${healthData.components.redis ? getStatusColor(healthData.components.redis.status) : 'text-gray-400'}`}>
                                    {healthData.components.redis?.status || 'UNKNOWN'}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Version: {healthData.components.redis?.details?.version || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Disk Space */}
                    <div className="bg-white rounded-lg border shadow-sm">
                        <div className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                            <h3 className="text-sm font-medium">Disk Space</h3>
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="p-6 pt-0">
                            <div className="flex items-center gap-2">
                                {healthData.components.diskSpace ? getStatusIcon(healthData.components.diskSpace.status) : <AlertCircle className="h-5 w-5 text-gray-400" />}
                                <div className={`text-2xl font-bold ${healthData.components.diskSpace ? getStatusColor(healthData.components.diskSpace.status) : 'text-gray-400'}`}>
                                    {healthData.components.diskSpace?.status || 'UNKNOWN'}
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Free: {healthData.components.diskSpace ? formatBytes(healthData.components.diskSpace.details!.free) : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>
            ) : null}
        </div >
    );
};

export default AdminSystemHealth;
