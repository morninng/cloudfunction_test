export interface EventData {
    created_by?: string,
    date_time_start?: number,
    date_time_finish?: number,
    duration?: number,
    participants?: Array<string>,
    title?: string;
    motion?: string;
    type?: string;

    start_date?: Date;
    start_time?: Date;
    finish_date?: Date;
    finish_time?: Date;

    group_data?: any;

}

