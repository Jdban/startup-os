java_binary(
    name = "job",
    srcs = [
        "ReviewerJob.java",
        "impl/ReviewerMetadataUpdaterTask.java",
        "tasks/Task.java",
        "tasks/TaskExecutor.java",
    ],
    main_class = "com.google.startupos.tools.reviewer.tools.reviewer.job.Job",
    deps = [
        "//common",
        "//common:dagger_with_annotation_processor",
        "//common/firestore",
        "//common/flags",
        "//common/repo",
        "//third_party/maven/com/google/auth:google_auth_library_credentials",
        "//third_party/maven/com/google/auth:google_auth_library_oauth2_http",
        "//third_party/maven/com/google/flogger",
        "//third_party/maven/com/google/flogger:flogger_system_backend",
        "//third_party/maven/javax/inject:javax_inject",
        "//tools/reviewer:reviewer_java_proto",
        "//tools/reviewer:reviewer_registry_java_proto",
    ],
)
