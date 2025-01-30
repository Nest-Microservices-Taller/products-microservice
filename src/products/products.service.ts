import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connection established');
  }

  async create(createProductDto: CreateProductDto) {
    return {
      message: 'Producto creado',
      data: await this.product.create({
        data: createProductDto
      })
    }
  }

  async findAll(paginationDto: PaginationDto) {

    const { limit, page } = paginationDto;

    const totalPage = await this.product.count({where: { available: true }});
    const lastPage = Math.ceil(totalPage / limit!)

    if (page! > lastPage) {
      return {
        data: [],
        message: 'No se encontraron mas registros',
        meta: {
          total: totalPage,
          page: page,
          lastPage: lastPage
        }
      }
    }

    return {
      meta: {
        total: totalPage,
        page: page,
        lastPage: lastPage
      },
      message: 'Registros encontrados',
      data: await this.product.findMany({
        skip: (page! - 1) * limit!,
        take: limit,
        where: { available: true }
      })

    }
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({ where: { id, available: true } });

    if (!product) {
      throw new NotFoundException({
        message: 'No se encontro el producto',
        data: null
      })
    }
    return {
      message: 'Producto encontrado',
      data: product
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {

    const {id:__, ...data} = updateProductDto;

    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: data
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    //return this.product.delete({ where: { id } });
    const product = await this.product.update({ where: { id }, data: { available: false } });

    return product

  }
}
