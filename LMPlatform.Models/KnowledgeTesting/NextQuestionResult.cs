﻿using System.Collections.Generic;

namespace LMPlatform.Models.KnowledgeTesting
{
    public class NextQuestionResult
    {
        public Question Question
        {
            get;
            set;
        }

        public int Number
        {
            get;
            set;
        }

        public Dictionary<int, PassedQuestionResult> QuestionsStatuses
        {
            get;
            set;
        }
    }
}
