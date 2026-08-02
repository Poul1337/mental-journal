import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JournalService {

    constructor(
        private readonly prisma: PrismaService
    ) {}
    
    //TODO: myEntriesList method
    //TODO: singleEntry method
    //TODO: createEntry method
    //TODO: editEntry method
    //TODO: deleteEntry method
}