// program_a.cpp
#include <iostream>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

int main()
{
    const char *name = "/my_shared_memory";
    const int SIZE = 4096;

    // 创建共享内存对象
    int shm_fd = shm_open(name, O_CREAT | O_RDWR, 0666);
    if (shm_fd == -1)
    {
        perror("shm_open");
        return 1;
    }

    // 配置共享内存大小
    ftruncate(shm_fd, SIZE);

    // 将共享内存映射到进程地址空间
    void *ptr = mmap(0, SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);
    if (ptr == MAP_FAILED)
    {
        perror("mmap");
        return 1;
    }

    // 写入数据
    int *data = static_cast<int *>(ptr);
    *data = 42;

    std::cout << "Written value: " << *data << std::endl;

    // 保持程序运行
    std::cout << "Program A is running. Press Enter to exit..." << std::endl;
    std::cin.get();

    // 清理
    munmap(ptr, SIZE);
    close(shm_fd);
    shm_unlink(name);

    return 0;
}
