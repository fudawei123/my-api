// program_b.cpp
#include <iostream>
#include <fcntl.h>
#include <sys/mman.h>
#include <sys/stat.h>
#include <unistd.h>

int main()
{
    const char *name = "/my_shared_memory";
    const int SIZE = 4096;

    // 打开共享内存对象
    int shm_fd = shm_open(name, O_RDONLY, 0666);
    if (shm_fd == -1)
    {
        perror("shm_open");
        return 1;
    }

    // 将共享内存映射到进程地址空间
    void *ptr = mmap(0, SIZE, PROT_READ, MAP_SHARED, shm_fd, 0);
    if (ptr == MAP_FAILED)
    {
        perror("mmap");
        return 1;
    }

    // 读取数据
    int *data = static_cast<int *>(ptr);
    std::cout << "Read value: " << *data << std::endl;

    // 清理
    munmap(ptr, SIZE);
    close(shm_fd);

    return 0;
}
