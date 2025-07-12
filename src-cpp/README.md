A few things to note:
* `elsetrec` struct, while unlikely, might have different offsets on different compilations, and different `sizeof` as well.
* `char` type is signed on current compilation, and so is written with `DataView#setInt8()`

There's a way to do memory leak checks by using `-fsanitize=leaks` build option, and `'___lsan_do_leak_check'` to exported functions, and call `Module.___lsan_do_leak_check()`.

Use fsave-optimization-record for vectorization info