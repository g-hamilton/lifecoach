export interface CourseQuestion {
    id: string; // the uid of this question
    // tslint:disable-next-line: max-line-length
    type: 'course' | 'platform'; // course: anything specific to the course content. Platform: anything the course creator is not responsible for.
    title: string;
    askerUid: string;
    askerFirstName: string;
    askerLastName: string;
    courseId: string;
    courseSellerId: string;
    lectureId: string;
    created: number; // unix timestamp at time of asking
    askerPhoto?: string;
    detail?: string;
    replies?: number;
    upVotes?: number;
}

export interface CourseQuestionReply {
    id: string; // the uid of this reply
    questionId: string; // the uid of the question being replied to
    replierUid: string;
    replierFirstName: string;
    replierLastName: string;
    created: number; // unix timestamp at time of reply
    replierPhoto?: string;
    detail?: string;
    upVotes?: number;
}
