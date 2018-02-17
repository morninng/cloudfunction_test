
export interface SpeechStatus {
    name: string;
    main_speaker: Speaker;
    speech_start_time: number;
    poi_speaker: PoiSpeaker;
    poi_candidates: {[key: string]: boolean}
    explicit_next_role: number,
}

export interface SpeechStatusDb {
    speech_status: SpeechStatus
    speech_log: SpeechLog
}

export interface SpeechLog {
    last_completed_role_num: number;
    completed_role_obj: number[]
}


export interface Speaker {
    user_id: string;
    team_side: string;
    role_name: string;
    role_num: number;
    speech_start_time: number
}
interface PoiSpeaker {
    user_id: string;
}

