﻿using System.ComponentModel;
using System.Linq;
using System.Web;
using Application.Core.UI.HtmlHelpers;
using LMPlatform.Models;
using LMPlatform.Models.KnowledgeTesting;
using System;
using System.Collections.Generic;

namespace LMPlatform.UI.ViewModels.KnowledgeTestingViewModels
{
    public class TestResultItemListViewModel : BaseNumberedGridItem
    {
        public class TestPassResultViewModel
        {
            public int StudentId { get; set; }

            public int TestId { get; set; }

            public int? Points { get; set; }

            public int? Percent { get; set; }

            public DateTime StartTime { get; set; }

            public User User { get; set; }

            public string Comment { get; set; }

            public int? CalculationType { get; set; }

            public string TestName { get; set; }

            public bool ForSelfStudy { get; set; }

            public static TestPassResultViewModel FromModel(TestPassResult model, Test test)
            {
                return new TestPassResultViewModel
                {
                    StudentId = model.StudentId,
                    TestId = model.TestId,
                    Points = model.Points,
                    Percent = model.Percent,
                    StartTime = model.StartTime,
                    User = model.User,
                    Comment = model.Comment,
                    CalculationType = model.CalculationType,
                    TestName = model.TestName,
                    ForSelfStudy = test?.ForSelfStudy ?? true
                };
            }
        }

        [DisplayName("Студент")]
        public string StudentName
        {
            get;
            set;
        }

        public string StudentShortName
        {
            get;
            set;
        }

        [DisplayName("Оценки")]
        public HtmlString Marks
        {
            get;
            set;
        }

        public TestPassResultViewModel[] TestPassResults
        {
            get;
            set;
        }

        public static TestResultItemListViewModel FromStudent(Student student, HtmlString marks, IEnumerable<Test> tests)
        {
            return new TestResultItemListViewModel
            {
                StudentName = student.FullName,
                StudentShortName = GetShortStudentName(student),
                Marks = marks,
                TestPassResults = student.User.TestPassResults.Select(x => TestPassResultViewModel.FromModel(x, tests.FirstOrDefault(y => y.Id == x.TestId))).ToArray()
            };
        }

        public static TestResultItemListViewModel FromStudent(Student student, IEnumerable<Test> tests)
        {
            return new TestResultItemListViewModel
            {
                StudentName = student.FullName,
                StudentShortName = GetShortStudentName(student),
                TestPassResults = student.User.TestPassResults.Select(x => TestPassResultViewModel.FromModel(x, tests.FirstOrDefault(y => y.Id == x.TestId))).ToArray()
            };
        }

        private static string GetShortStudentName(Student student)
        {
            return student.LastName + ' ' + student.FirstName[0] + '.';
        }
    }
}