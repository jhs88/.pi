# Integrate explicit workflows

Type: task
Status: open
Blocked by: 03

## Question

Implement and verify the chosen workflow architecture with explicit-only invocation, no `ultracode` trigger, a maximum of three local children, structured phase outputs, inspectable artifacts, clear background notifications, and complete child-tool guards. Children must exclude workflow tools; `Agent`, `get_subagent_result`, and `steer_subagent`; `ask_user`; and `bg_start`, `bg_status`, `bg_list`, and `bg_kill`.
