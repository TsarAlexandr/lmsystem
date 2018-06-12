﻿angular
    .module('btsApp.ctrl.project', ['btsApp.directive.projectUser', 'btsApp.service.projects', 'btsApp.directive.onChooseFile'])
    .controller('projectCtrl', [
        '$scope',
        '$routeParams',
        'projectsService',
        function ($scope, $routeParams, projectsService) {
            var MAX_FILES = 10;
            var MATRIX_REQUIREMENTS_LABEL = 'Файл требований';
            var MATRIX_TEST_LABEL = 'Файл тестов';

            $scope.project = {};
            $scope.comments = {};
            $scope.commentToSend = "";
            $scope.files = [];
            $scope.matrix = {
                requirementsFile: null,
                requirementsLabel: MATRIX_REQUIREMENTS_LABEL,
                testsFile: null,
                testsLabel: MATRIX_TEST_LABEL
            };
            
            var projectManagerRoleName = 'Руководитель проекта';

            function init() {
                setProject();
            }

            function disabledComment(comment) {
                return !($scope.project.Members.some(function (elem) {
                    return elem.Name === comment.UserName;
                }));
            }

            function setCommentStatus(comment) {
                if (disabledComment(comment)) {
                    comment.disabled = true;
                }
            }

            function setComments() {
                projectsService.getProjectComments($routeParams.id).then(function (response) {
                    $scope.comments = response.data.Comments;

                    $scope.comments.forEach(function (elem) {
                        setCommentStatus(elem);
                    });
                });
            }

            function clearBugs() {
                $scope.bugs = {
                    totalCount: 0,
                    types: [
                        {
                            name: 'Низкая',
                            count: 0,
                            style: { width: '0%' }
                        },
                        {
                            name: 'Средняя',
                            count: 0,
                            style: { width: '0%' }
                        },
                        {
                            name: 'Высокая',
                            count: 0,
                            style: { width: '0%' }
                        },
                        {
                            name: 'Критическая',
                            count: 0,
                            style: { width: '0%' }
                        }
                    ],
                    statuses: []
                };
            }

            function setFiles() {
                projectsService.getFiles($routeParams.id).then(function (response) {
                    $scope.files = response.data.ProjectFiles;
                });
            }

            function setProject() {
                clearBugs();
                projectsService.getProjectWithBugsAndMembers($routeParams.id).then(function (response) {
                    $scope.setTitle(response.data.Project.Title);
                    $scope.project = response.data.Project;
                    setBugs();
                    setComments();
                });
                setFiles();
            }

            function setBugs() {
                $scope.bugs.totalCount = $scope.project.Bugs.length;
                $scope.project.Bugs.forEach(function (bug) {
                    $scope.bugs.types.forEach(function (bugType) {
                        if (bugType.name === bug.Severity) {
                            bugType.count = bugType.count + 1;
                        }
                    });
                });
                $scope.bugs.types.forEach(function (bugType) {
                    var percantage = bugType.count * 100.0 / $scope.bugs.totalCount;
                    bugType.style.width =  percantage + '%';
                });

                //Find out why Morris can't load properly
                setTimeout(function () {
                    setBugsStatuses();
                    setGraph();
                }, 100);
            }

            function setBugsStatuses() {
                $scope.project.Bugs.forEach(function (bug) {
                    var existingElem;
                    var exist = $scope.bugs.statuses.some(function (elem) {
                        existingElem = elem;
                        return elem.label === bug.Status;
                    });
                    if (exist) {
                        existingElem.count = existingElem.count + 1;
                    } else {
                        $scope.bugs.statuses.push({ label: bug.Status, count: 1 });
                    }
                });

                $scope.bugs.statuses.forEach(function (elem) {
                    elem.value = elem.count * 100.0 / $scope.bugs.totalCount;
                });
            }

            function setGraph() {

                Morris.Donut({
                    element: 'graph',
                    data: $scope.bugs.statuses,
                    formatter: function (x) { return x + "%" }
                });
            }

            $scope.isProjectManager = function () {
                if ($scope.project.Members) {
                    return $scope.project.Members.some(function (elem) {
                        return elem.UserId === $scope.$parent.userId && elem.Role === projectManagerRoleName;
                    });
                }
            }

            $scope.onAddStudent = function () {
                $.savingDialog("Добавление студента к проекту", "/BTS/AssignStudentOnProject/" + $scope.project.Id,
                    null, "primary", function (data) {
                        setProject();
                        alertify.success("Добавлен новый участник");
                    });
            }

            $scope.onAddLecturer = function () {
                $.savingDialog("Добавление лектора к проекту", "/BTS/AssignLecturerOnProject/" + $scope.project.Id,
                    null, "primary", function (data) {
                        setProject();
                        alertify.success("Добавлен новый участник");
                    });
            }

            $scope.onClearProject = function () {
                bootbox.confirm({
                    title: 'Очистка проекта',
                    message: 'Вы действительно хотите очистить проект (удалить участников, ошибки и комментарии)?',
                    buttons: {
                        'cancel': {
                            label: 'Отмена',
                            className: 'btn btn-default btn-sm'
                        },
                        'confirm': {
                            label: 'Очистить',
                            className: 'btn btn-primary btn-sm',
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            $.post("/BTS/ClearProject/" + $scope.project.Id, null, function () {});
                            location.reload();
                        }
                    }
                });
            }

            function deleteProjectUser(id) {
                projectsService.deleteProjectUser(id).then(function (response) {
                    setProject();
                    alertify.success("Участник проекта удален");
                });
            }

            $scope.onDeleteProjectUser = function (id) {
                bootbox.confirm({
                    title: 'Удаление участника проекта',
                    message: 'Вы дествительно хотите удалить участника проекта?',
                    buttons: {
                        'cancel': {
                            label: 'Отмена',
                            className: 'btn btn-default btn-sm'
                        },
                        'confirm': {
                            label: 'Удалить',
                            className: 'btn btn-primary btn-sm',
                        }
                    },
                    callback: function (result) {
                        if (result) {
                            deleteProjectUser(id);
                        }
                    }
                });
            };

            $scope.$on('$viewContentLoaded', function () {
                $('.panel-heading span.clickable').on('click', function (e) {
                    var $this = $(this);
                    if (!$this.hasClass('panel-collapsed')) {
                        $this.parents('.panel').find('.panel-body').slideUp();
                        $this.addClass('panel-collapsed');
                        $this.find('i').removeClass('glyphicon-minus').addClass('glyphicon-plus');
                        $(".panel-footer").slideUp();
                    } else {
                        $this.parents('.panel').find('.panel-body').slideDown();
                        $this.removeClass('panel-collapsed');
                        $this.find('i').removeClass('glyphicon-plus').addClass('glyphicon-minus');
                        $(".panel-footer").slideDown();
                    }
                });
                $('.panel div.clickable').on('click', function (e) {
                    var $this = $(this);
                    if (!$this.hasClass('panel-collapsed')) {
                        $this.parents('.panel').find('.panel-body').slideUp();
                        $this.addClass('panel-collapsed');
                        $this.find('i').removeClass('glyphicon-minus').addClass('glyphicon-plus');
                        $(".panel-footer").slideUp();
                    } else {
                        $this.parents('.panel').find('.panel-body').slideDown();
                        $this.removeClass('panel-collapsed');
                        $this.find('i').removeClass('glyphicon-plus').addClass('glyphicon-minus');
                        $(".panel-footer").slideDown();
                    }
                });
            });

            $scope.onSendComment = function () {
                projectsService.sendProjectComment($routeParams.id, $scope.commentToSend).then(function (response) {
                    $scope.commentToSend = "";
                    setComments();
                });
            };

            $scope.uploadFile = function (event) {
                var file = event.target.files[0];
                projectsService.uploadFile($routeParams.id, file, function (response) {
                    setFiles();
                });
                event.target.value = "";
            };

            $scope.isUploadable = function () {
                return $scope.files.length < MAX_FILES;
            };

            $scope.deleteFile = function (file) {
                projectsService.deleteFile($routeParams.id, file.FileName).then(function (response) {
                    setFiles();
                });
            }

            $scope.onOpenMatrixForm = function () {
                $('#matrixForm').modal();
            };

            $scope.setMatrixRequirementsFile = function (file) {
                $scope.matrix.requirementsFile = file;
                $scope.matrix.requirementsLabel = file.Name;
            };

            $scope.setMatrixTestsFile = function (file) {
                $scope.matrix.testsFile = file;
                $scope.matrix.testsLabel = file.Name;
            };

            $scope.generateMatrix = function () {
                matrix = $scope.matrix;
                projectsService.generateMatrix($routeParams.id, matrix.requirementsFile.FileName, matrix.testsFile.FileName).then(function (response) {
                    
                });
            };

            init();
        }]);
