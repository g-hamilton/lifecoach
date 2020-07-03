export interface CourseBookmark {
    userId: string;
    courseId: string;
    lectureId: string;
    position: number;
    lastUpdated: number; // unix timestamp
    note?: string;
    id?: string;
}
